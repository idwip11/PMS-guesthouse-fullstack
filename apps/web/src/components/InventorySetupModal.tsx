import { useState, useEffect } from 'react';
import { inventoryApi } from '../services/api';
import type { InventoryItem } from '../types';

interface InventorySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InventorySetupModal({ isOpen, onClose }: InventorySetupModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Toiletries');
  const [newItemContactVendor, setNewItemContactVendor] = useState('');
  const [adding, setAdding] = useState(false);

  // Editing state - track which items are being edited
  const [editedItems, setEditedItems] = useState<Record<string, { currentStock: number; minThreshold: number; contactVendor: string }>>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      fetchInventory();
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAll();
      setItems(data);
      setEditedItems({});
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      alert('Please enter an item name');
      return;
    }

    try {
      setAdding(true);
      const newItem = await inventoryApi.create({
        name: newItemName.trim(),
        category: newItemCategory,
        currentStock: 0,
        minThreshold: 10,
        unit: 'pcs',
        contactVendor: newItemContactVendor.trim()
      });
      
      setItems([...items, newItem]);
      setNewItemName('');
      setNewItemCategory('Toiletries');
      setNewItemContactVendor('');
      alert('Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  const handleStockChange = (itemId: string, value: number) => {
    setEditedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId] || {}, // Initialize if undefined
        currentStock: value,
        minThreshold: prev[itemId]?.minThreshold ?? items.find(i => i.id === itemId)?.minThreshold ?? 0,
        contactVendor: prev[itemId]?.contactVendor ?? items.find(i => i.id === itemId)?.contactVendor ?? ''
      }
    }));
  };

  const handleThresholdChange = (itemId: string, value: number) => {
    setEditedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId] || {}, // Initialize if undefined
        currentStock: prev[itemId]?.currentStock ?? items.find(i => i.id === itemId)?.currentStock ?? 0,
        minThreshold: value,
        contactVendor: prev[itemId]?.contactVendor ?? items.find(i => i.id === itemId)?.contactVendor ?? ''
      }
    }));
  };

  const handleContactVendorChange = (itemId: string, value: string) => {
    setEditedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId] || {}, // Initialize if undefined
        currentStock: prev[itemId]?.currentStock ?? items.find(i => i.id === itemId)?.currentStock ?? 0,
        minThreshold: prev[itemId]?.minThreshold ?? items.find(i => i.id === itemId)?.minThreshold ?? 0,
        contactVendor: value
      }
    }));
  };

  const handleSaveItem = async (item: InventoryItem) => {
    try {
      const edited = editedItems[item.id];
      const updatedItem = await inventoryApi.update(item.id, {
        currentStock: edited?.currentStock ?? item.currentStock,
        minThreshold: edited?.minThreshold ?? item.minThreshold,
        contactVendor: edited?.contactVendor ?? item.contactVendor
      });
      
      setItems(items.map(i => i.id === item.id ? updatedItem : i));
      
      // Remove from edited items
      const newEdited = { ...editedItems };
      delete newEdited[item.id];
      setEditedItems(newEdited);
      
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await inventoryApi.delete(itemId);
      setItems(items.filter(i => i.id !== itemId));
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const getCurrentStock = (item: InventoryItem) => {
    return editedItems[item.id]?.currentStock ?? item.currentStock;
  };

  const getMinThreshold = (item: InventoryItem) => {
    return editedItems[item.id]?.minThreshold ?? item.minThreshold;
  };

  const getContactVendor = (item: InventoryItem) => {
    return editedItems[item.id]?.contactVendor ?? item.contactVendor ?? '';
  };

  const hasChanges = (itemId: string) => {
    return editedItems[itemId] !== undefined;
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 ${!isOpen ? 'pointer-events-none' : ''}`}
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div 
            className={`relative transform overflow-hidden rounded-2xl glass-card text-left shadow-2xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-3xl border border-white/50 dark:border-slate-700/50 ${
              isOpen ? 'opacity-100 translate-y-0 sm:scale-100' : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            }`}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white" id="modal-title">
                Inventory Setup
              </h3>
              <button 
                onClick={onClose}
                type="button"
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-8">
              {/* Add New Item */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Add New Item</h4>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Item Name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    className="flex-1 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:border-primary focus:ring-primary dark:text-white px-3 py-2"
                  />
                  <input 
                    type="text" 
                    placeholder="Contact Vendor"
                    value={newItemContactVendor}
                    onChange={(e) => setNewItemContactVendor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    className="flex-1 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:border-primary focus:ring-primary dark:text-white px-3 py-2"
                  />
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:border-primary focus:ring-primary dark:text-white px-3 py-2"
                  >
                    <option value="Toiletries">Toiletries</option>
                    <option value="Bedding">Bedding</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Other">Other</option>
                  </select>
                  <button 
                    onClick={handleAddItem}
                    disabled={adding}
                    className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-icons-round text-sm">add</span>
                    {adding ? 'Adding...' : 'Add Item'}
                  </button>
                </div>
              </div>

              {/* Existing Inventory Items */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Existing Inventory Items</h4>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-slate-500">Loading inventory...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No inventory items yet. Add your first item above!
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700/50">
                      <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Name</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact Vendor</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Stock</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Threshold</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 dark:bg-slate-800/20 divide-y divide-gray-100 dark:divide-gray-700/50">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                              {item.name}
                              <div className="text-xs text-slate-400 font-normal">{item.category}</div>
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="text" 
                                value={getContactVendor(item)}
                                onChange={(e) => handleContactVendorChange(item.id, e.target.value)}
                                placeholder="Vendor"
                                className="w-full px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary" 
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="number" 
                                value={getCurrentStock(item)}
                                onChange={(e) => handleStockChange(item.id, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary text-center" 
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="number" 
                                value={getMinThreshold(item)}
                                onChange={(e) => handleThresholdChange(item.id, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary text-center" 
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {hasChanges(item.id) && (
                                  <button 
                                    onClick={() => handleSaveItem(item)}
                                    className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors" 
                                    title="Save"
                                  >
                                    <span className="material-icons-round text-lg">save</span>
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" 
                                  title="Delete"
                                >
                                  <span className="material-icons-round text-lg">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>


            {/* Footer */}
            <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-gray-100 dark:border-gray-700/50">
              <button 
                type="button"
                className="w-full inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                onClick={onClose}
              >
                Done
              </button>
              <button 
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
