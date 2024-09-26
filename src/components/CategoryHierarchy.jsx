import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import './CategoryHierarchy.css'; // Importing the CSS file

export default function CategoryHierarchy() {
  const [categories, setCategories] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);

  const addCategory = (parentId = null) => {
    const newCategory = {
      id: Date.now().toString(),
      name: '',
      fieldName: '',
      fieldName1: '',
      subcategories: []
    };
    if (parentId === null) {
      setCategories([...categories, newCategory]);
    } else {
      setCategories(updateCategories(categories, parentId, newCategory));
    }
  };

  const updateCategories = (cats, id, newCat) => {
    return cats.map(cat => {
      if (cat.id === id) {
        return { ...cat, subcategories: [...cat.subcategories, newCat] };
      }
      if (cat.subcategories.length > 0) {
        return { ...cat, subcategories: updateCategories(cat.subcategories, id, newCat) };
      }
      return cat;
    });
  };

  const handleInputChange = (id, field, value) => {
    setCategories(updateCategoryField(categories, id, field, value));
  };

  const updateCategoryField = (cats, id, field, value) => {
    return cats.map(cat => {
      if (cat.id === id) {
        return { ...cat, [field]: value };
      }
      if (cat.subcategories.length > 0) {
        return { ...cat, subcategories: updateCategoryField(cat.subcategories, id, field, value) };
      }
      return cat;
    });
  };

  const renderCategoryInputs = (category, depth = 0) => {
    return (
      <div key={category.id} className="category-input" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="category-row">
          <input
            type="text"
            value={category.name}
            onChange={(e) => handleInputChange(category.id, 'name', e.target.value)}
            placeholder={`Category ${depth + 1}`}
            className="input"
          />
          <input
            type="text"
            value={category.fieldName}
            onChange={(e) => handleInputChange(category.id, 'fieldName', e.target.value)}
            placeholder="Field Name"
            className="input"
          />
          <input
            type="text"
            value={category.fieldName1}
            onChange={(e) => handleInputChange(category.id, 'fieldName1', e.target.value)}
            placeholder="Field Name 1"
            className="input"
          />
          <button onClick={() => addCategory(category.id)} className="add-button">
            <PlusCircle className="icon" /> Add Subcategory
          </button>
        </div>
        {category.subcategories.map(subcat => renderCategoryInputs(subcat, depth + 1))}
      </div>
    );
  };

  const handleSubmit = () => {
    setSubmittedData(categories);
  };

  const renderCategoryTable = (categories, depth = 0) => {
    return categories.flatMap(category => [
      <tr key={category.id}>
        <td className="table-cell" style={{ paddingLeft: `${depth * 20}px` }}>
          {category.name}
        </td>
        <td className="table-cell">{category.fieldName}</td>
        <td className="table-cell">{category.fieldName1}</td>
      </tr>,
      ...renderCategoryTable(category.subcategories, depth + 1)
    ]);
  };

  return (
    <div className="category-hierarchy-container">
      <button onClick={() => addCategory()} className="add-category-button">
        ADD Category
      </button>
      <div className="category-list">
        {categories.map(category => renderCategoryInputs(category))}
      </div>
      <button onClick={handleSubmit} className="submit-button">Submit</button>
      {submittedData.length > 0 && (
        <div className="table-container">
          <table className="category-table">
            <thead>
              <tr>
                <th className="table-header">Categories</th>
                <th className="table-header">Field Name</th>
                <th className="table-header">Field Name 1</th>
              </tr>
            </thead>
            <tbody>
              {renderCategoryTable(submittedData)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
