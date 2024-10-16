import { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaTrash } from "react-icons/fa"; // Importing Font Awesome icons, including FaTrash
import "./CategoryHierarchy.css"; // Importing the CSS file

// SVG Icon Components
export function BiPlus(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.4em"
      height="1.4em"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill="currentColor"
        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"
      ></path>
    </svg>
  );
}

export function LsiconDownOutline(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      {...props}
    >
      <path fill="none" stroke="currentColor" d="M4.5 6L8 9.5L11.5 6"></path>
    </svg>
  );
}

export function CharmTick(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m2.75 8.75l3.5 3.5l7-7.5"
      ></path>
    </svg>
  );
}

export default function CategoryHierarchy() {
  // State Variables
  const [categories, setCategories] = useState([]);
  const [submittedData, setSubmittedData] = useState(() => {
    // Initialize from localStorage if available
    const savedData = localStorage.getItem("submittedData");
    return savedData ? JSON.parse(savedData) : {};
  });
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for toggling dropdown
  const [editRows, setEditRows] = useState({}); // State for tracking edited rows

  // List of Languages
  const languages = ["English", "Spanish", "French", "German", "Chinese"];

  // Function to Add Category, Subcategory, or Subboard
  const addCategory = (parentId = null, type = "subcategory") => {
    const newCategoryOrBoard = {
      id: `${Date.now()}-${Math.random()}`, // Ensure unique ID
      name: "",
      fieldName: "",
      fieldName1: "",
      subcategories: [],
      subboards: [],
      type: type, // Differentiating between subcategory and subboard
    };

    if (parentId === null) {
      setCategories([...categories, newCategoryOrBoard]);
    } else {
      setCategories(
        updateCategories(categories, parentId, newCategoryOrBoard, type)
      );
    }
  };

  // Recursive Function to Update Categories
  const updateCategories = (cats, id, newCat, type) => {
    return cats.map((cat) => {
      if (cat.id === id) {
        if (type === "subcategory") {
          return { ...cat, subcategories: [...cat.subcategories, newCat] };
        } else if (type === "subboard") {
          return { ...cat, subboards: [...cat.subboards, newCat] };
        }
      }
      return {
        ...cat,
        subcategories: updateCategories(cat.subcategories, id, newCat, type),
        subboards: updateCategories(cat.subboards, id, newCat, type),
      };
    });
  };

  // Function to Handle Input Changes in Category Inputs
  const handleInputChange = (id, field, value) => {
    setCategories(updateCategoryField(categories, id, field, value));
  };

  // Recursive Function to Update Category Fields
  const updateCategoryField = (cats, id, field, value) => {
    return cats.map((cat) => {
      if (cat.id === id) {
        return { ...cat, [field]: value };
      }
      return {
        ...cat,
        subcategories: updateCategoryField(cat.subcategories, id, field, value),
        subboards: updateCategoryField(cat.subboards, id, field, value),
      };
    });
  };

  // Recursive Function to Render Category Inputs
  const renderCategoryInputs = (category, depth = 0) => {
    const isSubboard = category.type === "subboard";

    return (
      <div
        key={category.id}
        className="category-input"
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className="category-row">
          <input
            type="text"
            value={category.name}
            onChange={(e) =>
              handleInputChange(category.id, "name", e.target.value)
            }
            placeholder={
              isSubboard ? `Subboard ${depth + 1}` : `Category ${depth + 1}`
            }
            className="input"
          />
          <input
            type="text"
            value={category.fieldName}
            onChange={(e) =>
              handleInputChange(category.id, "fieldName", e.target.value)
            }
            placeholder={isSubboard ? "Subboard Field" : "Field Name"}
            className="input"
          />
          <input
            type="text"
            value={category.fieldName1}
            onChange={(e) =>
              handleInputChange(category.id, "fieldName1", e.target.value)
            }
            placeholder={isSubboard ? "Subboard Field 1" : "Field Name 1"}
            className="input"
          />

          {/* Show buttons only for categories, not subboards */}
          {!isSubboard && (
            <>
              <button
                onClick={() => addCategory(category.id, "subcategory")}
                className="add-button"
              >
                <BiPlus />
                Add Subcategory
              </button>
              <button
                onClick={() => addCategory(category.id, "subboard")}
                className="add-button"
              >
                <BiPlus />
                Add Subboard
              </button>
            </>
          )}
        </div>

        {/* Render subcategories and subboards recursively */}
        {category.subcategories.map((subcat) =>
          renderCategoryInputs(subcat, depth + 1)
        )}
        {category.subboards.map((subboard) =>
          renderCategoryInputs(subboard, depth + 1)
        )}
      </div>
    );
  };

  // Function to Handle Language Selection
  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setIsLanguageSelected(true);
    setIsDropdownOpen(false);
    setCategories([]);
  };

  // Function to Handle Form Submission
  const handleSubmit = () => {
    const emptyCategories = findEmptyCategories(categories);
    if (emptyCategories.length > 0) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    setSubmittedData((prevData) => {
      const existingCategories = prevData[selectedLanguage] || [];
      const updatedData = {
        ...prevData,
        [selectedLanguage]: [...existingCategories, ...categories],
      };

      // Persist data to localStorage
      localStorage.setItem("submittedData", JSON.stringify(updatedData));

      console.log("Submitted Data:", updatedData); // Log the updated data here
      return updatedData;
    });

    // Clear the input fields after submission
    setCategories([]);
  };

  // Helper Function to Find Empty Categories
  const findEmptyCategories = (cats) => {
    let empty = [];
    cats.forEach((cat) => {
      if (!cat.name || !cat.fieldName || !cat.fieldName1) {
        empty.push(cat);
      }
      empty = empty.concat(findEmptyCategories(cat.subcategories));
      empty = empty.concat(findEmptyCategories(cat.subboards));
    });
    return empty;
  };

  // Function to Toggle Edit Mode for a Row
  const toggleEditMode = (id, category) => {
    setEditRows((prev) => ({
      ...prev,
      [id]: {
        name: category.name,
        fieldName: category.fieldName,
        fieldName1: category.fieldName1,
      },
    }));
  };

  // Function to Handle Input Changes in Edit Mode
  const handleEditInputChange = (id, field, value) => {
    setEditRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Function to Save Edited Row
  const saveEdit = (language, id) => {
    const updatedData = submittedData[language].map((category) =>
      updateCategoryInData(category, id, editRows[id])
    );

    setSubmittedData((prevData) => {
      const updatedSubmittedData = {
        ...prevData,
        [language]: updatedData,
      };

      // Persist updated data to localStorage
      localStorage.setItem("submittedData", JSON.stringify(updatedSubmittedData));

      return updatedSubmittedData;
    });

    // Remove the row from editRows
    setEditRows((prev) => {
      const updatedEditRows = { ...prev };
      delete updatedEditRows[id];
      return updatedEditRows;
    });
  };

  // Function to Cancel Edit Mode
  const cancelEdit = (id) => {
    setEditRows((prev) => {
      const updatedEditRows = { ...prev };
      delete updatedEditRows[id];
      return updatedEditRows;
    });
  };

  // Recursive Function to Update Category in Submitted Data
  const updateCategoryInData = (category, id, updatedFields) => {
    if (category.id === id) {
      return { ...category, ...updatedFields };
    }
    return {
      ...category,
      subcategories: category.subcategories.map((sub) =>
        updateCategoryInData(sub, id, updatedFields)
      ),
      subboards: category.subboards.map((sub) =>
        updateCategoryInData(sub, id, updatedFields)
      ),
    };
  };

  // Function to Handle Deletion of a Category
  const handleDelete = (language, id) => {
    // Confirmation prompt
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;

    setSubmittedData((prevData) => {
      const updatedData = {
        ...prevData,
        [language]: deleteCategoryById(prevData[language], id),
      };

      // Persist updated data to localStorage
      localStorage.setItem("submittedData", JSON.stringify(updatedData));

      return updatedData;
    });
  };

  // Recursive Function to Delete a Category by ID
  const deleteCategoryById = (categories, id) => {
    return categories
      .filter((category) => category.id !== id)
      .map((category) => ({
        ...category,
        subcategories: deleteCategoryById(category.subcategories, id),
        subboards: deleteCategoryById(category.subboards, id),
      }));
  };

  // Recursive Function to Render Submitted Data Table
  const renderCategoryTable = (categories = [], depth = 0, language) => {
    let rows = [];

    categories.forEach((category) => {
      const isEditing = editRows.hasOwnProperty(category.id);

      rows.push(
        <tr key={category.id}>
          <td className="table-cell" style={{ paddingLeft: `${depth * 20}px` }}>
            {isEditing ? (
              <input
                type="text"
                value={editRows[category.id].name}
                onChange={(e) =>
                  handleEditInputChange(category.id, "name", e.target.value)
                }
                className="input edit-input"
              />
            ) : (
              category.name
            )}
          </td>
          <td className="table-cell">
            {isEditing ? (
              <input
                type="text"
                value={editRows[category.id].fieldName}
                onChange={(e) =>
                  handleEditInputChange(
                    category.id,
                    "fieldName",
                    e.target.value
                  )
                }
                className="input edit-input"
              />
            ) : (
              category.fieldName
            )}
          </td>
          <td className="table-cell">
            {isEditing ? (
              <input
                type="text"
                value={editRows[category.id].fieldName1}
                onChange={(e) =>
                  handleEditInputChange(
                    category.id,
                    "fieldName1",
                    e.target.value
                  )
                }
                className="input edit-input"
              />
            ) : (
              category.fieldName1
            )}
          </td>
          <td className="table-cell">
            {isEditing ? (
              <>
                <button
                  onClick={() => saveEdit(language, category.id)}
                  className="action-button save-button"
                  aria-label="Save"
                >
                  <FaSave />
                </button>
                <button
                  onClick={() => cancelEdit(category.id)}
                  className="action-button cancel-button"
                  aria-label="Cancel"
                >
                  <FaTimes />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => toggleEditMode(category.id, category)}
                  className="action-button edit-button"
                  aria-label="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(language, category.id)}
                  className="action-button delete-button"
                  aria-label="Delete"
                >
                  <FaTrash />
                </button>
              </>
            )}
          </td>
        </tr>
      );

      // Recursively render subcategories and subboards
      if (category.subcategories.length > 0) {
        rows = rows.concat(
          renderCategoryTable(category.subcategories, depth + 1, language)
        );
      }
      if (category.subboards.length > 0) {
        rows = rows.concat(
          renderCategoryTable(category.subboards, depth + 1, language)
        );
      }
    });

    return rows;
  };

  return (
    <div
      className="container"
      style={{
        width: "100%",
        position: "relative",
        maxWidth: "1440px",
        margin: "0 auto",
      }}
    >
      <div className="category-hierarchy-container">
        {/* Language Dropdown */}
        <div className="addcategory-btn-language">
          <div className="language-dropdown">
            <label>Select Language: </label>
            <div className="language-dropdown-button">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="dropdown-toggle"
              >
                {selectedLanguage || "--Choose a Language--"}
                <LsiconDownOutline className="dropdown-icon" />
              </button>

              {isDropdownOpen && (
                <div className="language-dropdown-open">
                  {languages.map((lang) => (
                    <div
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`language-dropdown-items ${
                        lang === selectedLanguage ? "selected" : ""
                      }`}
                    >
                      {lang}
                      {lang === selectedLanguage && (
                        <span className="tick-mark">
                          <CharmTick />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Conditionally Render the Add Category Button Only After a Language is Selected */}
          {isLanguageSelected && (
            <>
              <button
                onClick={() => addCategory()}
                className="add-category-button"
              >
                ADD Category
              </button>
            </>
          )}
        </div>

        {/* Category Inputs */}
        <div className="category-list">
          {isLanguageSelected && (
            <>
              <hr className="horizental-line" />
              <div className="category-list">
                {categories.map((category) => renderCategoryInputs(category))}
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        {isLanguageSelected && categories.length > 0 && (
          <div className="submit-button-container">
            <hr className="horizental-line" />
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
          </div>
        )}

        {/* Display Submitted Data */}
        {Object.keys(submittedData).length > 0 && (
          <div className="table-container">
            <h3>Submitted Data:</h3>
            {Object.keys(submittedData).map((language) => (
              <div key={language}>
                <h4>{language}</h4>
                <table className="category-table">
                  <thead>
                    <tr>
                      <th className="table-header">Categories</th>
                      <th className="table-header">Field Name</th>
                      <th className="table-header">Field Name 1</th>
                      <th className="table-header">Actions</th> {/* Added Actions Header */}
                    </tr>
                  </thead>
                  <tbody>
                    {renderCategoryTable(
                      submittedData[language],
                      0,
                      language
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
