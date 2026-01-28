// Prime Commodities API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Function to Add Prime Commodities Data
export const addPrimeCommoditiesData = async (data) => {
  try {
    console.log(`📤 Adding Prime Commodities to ${API_URL}/prime-commodities:`, data);
    const response = await fetch(`${API_URL}/prime-commodities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    const result = await response.json();
    console.log("✅ Prime Commodities data saved:", result);
    return result;
  } catch (e) {
    console.error("❌ Error adding Prime Commodities:", e);
    throw e;
  }
};

// Function to Fetch All Prime Commodities Data
export const getPrimeCommoditiesData = async () => {
  try {
    const response = await fetch(`${API_URL}/prime-commodities`);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    return data.map(item => ({ id: item._id, ...item }));
  } catch (e) {
    console.error("❌ Error fetching Prime Commodities:", e);
    return [];
  }
};

// Function to Delete Prime Commodities Record
export const deletePrimeCommoditiesData = async (id) => {
  try {
    const response = await fetch(`${API_URL}/prime-commodities/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete data');
    console.log("✅ Prime Commodities record deleted");
  } catch (e) {
    console.error("❌ Error deleting Prime Commodities:", e);
    throw e;
  }
};

// Function to Update Prime Commodities Record
export const updatePrimeCommoditiesData = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/prime-commodities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update data');
    console.log("✅ Prime Commodities record updated");
    return await response.json();
  } catch (e) {
    console.error("❌ Error updating Prime Commodities:", e);
    throw e;
  }
};

export default { addPrimeCommoditiesData, getPrimeCommoditiesData, deletePrimeCommoditiesData, updatePrimeCommoditiesData };
