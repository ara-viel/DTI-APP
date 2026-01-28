// Basic Necessities API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Function to Add Basic Necessities Data
export const addBasicNecessitiesData = async (data) => {
  try {
    console.log(`📤 Adding Basic Necessities to ${API_URL}/basic-necessities:`, data);
    const response = await fetch(`${API_URL}/basic-necessities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    const result = await response.json();
    console.log("✅ Basic Necessities data saved:", result);
    return result;
  } catch (e) {
    console.error("❌ Error adding Basic Necessities:", e);
    throw e;
  }
};

// Function to Fetch All Basic Necessities Data
export const getBasicNecessitiesData = async () => {
  try {
    const response = await fetch(`${API_URL}/basic-necessities`);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    return data.map(item => ({ id: item._id, ...item }));
  } catch (e) {
    console.error("❌ Error fetching Basic Necessities:", e);
    return [];
  }
};

// Function to Delete Basic Necessities Record
export const deleteBasicNecessitiesData = async (id) => {
  try {
    const response = await fetch(`${API_URL}/basic-necessities/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete data');
    console.log("✅ Basic Necessities record deleted");
  } catch (e) {
    console.error("❌ Error deleting Basic Necessities:", e);
    throw e;
  }
};

// Function to Update Basic Necessities Record
export const updateBasicNecessitiesData = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/basic-necessities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update data');
    console.log("✅ Basic Necessities record updated");
    return await response.json();
  } catch (e) {
    console.error("❌ Error updating Basic Necessities:", e);
    throw e;
  }
};

export default { addBasicNecessitiesData, getBasicNecessitiesData, deleteBasicNecessitiesData, updateBasicNecessitiesData };
