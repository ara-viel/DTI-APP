// Construction Materials API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Function to Add Construction Materials Data
export const addConstructionMaterialsData = async (data) => {
  try {
    console.log(`📤 Adding Construction Materials to ${API_URL}/construction-materials:`, data);
    const response = await fetch(`${API_URL}/construction-materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    const result = await response.json();
    console.log("✅ Construction Materials data saved:", result);
    return result;
  } catch (e) {
    console.error("❌ Error adding Construction Materials:", e);
    throw e;
  }
};

// Function to Fetch All Construction Materials Data
export const getConstructionMaterialsData = async () => {
  try {
    const response = await fetch(`${API_URL}/construction-materials`);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    return data.map(item => ({ id: item._id, ...item }));
  } catch (e) {
    console.error("❌ Error fetching Construction Materials:", e);
    return [];
  }
};

// Function to Delete Construction Materials Record
export const deleteConstructionMaterialsData = async (id) => {
  try {
    const response = await fetch(`${API_URL}/construction-materials/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete data');
    console.log("✅ Construction Materials record deleted");
  } catch (e) {
    console.error("❌ Error deleting Construction Materials:", e);
    throw e;
  }
};

// Function to Update Construction Materials Record
export const updateConstructionMaterialsData = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/construction-materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update data');
    console.log("✅ Construction Materials record updated");
    return await response.json();
  } catch (e) {
    console.error("❌ Error updating Construction Materials:", e);
    throw e;
  }
};

export default { addConstructionMaterialsData, getConstructionMaterialsData, deleteConstructionMaterialsData, updateConstructionMaterialsData };
