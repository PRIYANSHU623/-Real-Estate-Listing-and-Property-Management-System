import React, { useState, useEffect } from 'react';
import { Property, PropertyCreateInput, PropertyStatus, PropertyType, PropertyUpdateInput } from '../../types';
import { Modal } from '../common/Modal';
import { propertiesApi } from '../../api/properties';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Building, MapPin, IndianRupee, Layers, FileText } from 'lucide-react';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyToEdit?: Property | null;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  propertyToEdit,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTMENT');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [rent, setRent] = useState<number>(35000);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [area, setArea] = useState<number>(1200);
  const [status, setStatus] = useState<PropertyStatus>('AVAILABLE');

  useEffect(() => {
    if (propertyToEdit) {
      setTitle(propertyToEdit.title);
      setDescription(propertyToEdit.description || '');
      setPropertyType(propertyToEdit.property_type);
      setAddress(propertyToEdit.address);
      setCity(propertyToEdit.city);
      setState(propertyToEdit.state);
      setPincode(propertyToEdit.pincode);
      setRent(propertyToEdit.rent);
      setBedrooms(propertyToEdit.bedrooms);
      setBathrooms(propertyToEdit.bathrooms);
      setArea(propertyToEdit.area || 1000);
      setStatus(propertyToEdit.status);
    } else {
      setTitle('');
      setDescription('');
      setPropertyType('APARTMENT');
      setAddress('');
      setCity('');
      setState('Maharashtra');
      setPincode('');
      setRent(35000);
      setBedrooms(2);
      setBathrooms(2);
      setArea(1100);
      setStatus('AVAILABLE');
    }
  }, [propertyToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation matching backend validators
    if (title.trim().length < 3) {
      error('Title must be at least 3 characters.');
      return;
    }
    if (address.trim().length < 5) {
      error('Address must be at least 5 characters.');
      return;
    }
    if (city.trim().length < 2) {
      error('City must be at least 2 characters.');
      return;
    }
    if (state.trim().length < 2) {
      error('State must be at least 2 characters.');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      error('Pincode must be exactly a 6-digit number.');
      return;
    }
    if (rent <= 0) {
      error('Monthly rent must be greater than 0.');
      return;
    }

    setLoading(true);
    try {
      if (propertyToEdit) {
        const updateData: PropertyUpdateInput = {
          title,
          description: description || undefined,
          property_type: propertyType,
          address,
          city,
          state,
          pincode,
          rent,
          bedrooms,
          bathrooms,
          area: area > 0 ? area : undefined,
          status,
        };
        await propertiesApi.update(propertyToEdit.id, updateData);
        success('Property updated successfully!');
      } else {
        const createData: PropertyCreateInput = {
          title,
          description: description || undefined,
          property_type: propertyType,
          address,
          city,
          state,
          pincode,
          rent,
          bedrooms,
          bathrooms,
          area: area > 0 ? area : undefined,
          status,
        };
        await propertiesApi.create(createData);
        success('New property listed successfully!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={propertyToEdit ? 'Edit Property Listing' : 'List a New Property'}
      subtitle="Fill in the details for your rental listing. All fields are verified against backend rules."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Skyline Towers 2BHK Luxury Apartment with Sea View"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Type & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type *</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">Independent House</option>
              <option value="VILLA">Luxury Villa</option>
              <option value="STUDIO">Studio Apartment</option>
              <option value="COMMERCIAL">Commercial Space</option>
              <option value="PLOT">Residential Plot</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PropertyStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="AVAILABLE">Available</option>
              <option value="BOOKED">Booked</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="INACTIVE">Inactive (Hidden)</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
          <input
            type="text"
            required
            placeholder="e.g. 402, Sunset Heights, Linking Road, Bandra West"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* City, State, 6-digit Pincode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
            <input
              type="text"
              required
              placeholder="e.g. Maharashtra"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pincode * <span className="text-[10px] text-slate-400">(6-digit)</span>
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="400050"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Rent, Bedrooms, Bathrooms, Area */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent (₹) *</label>
            <input
              type="number"
              required
              min={1}
              value={rent}
              onChange={(e) => setRent(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
            <input
              type="number"
              min={0}
              max={20}
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
            <input
              type="number"
              min={0}
              max={20}
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Area (sq.ft)</label>
            <input
              type="number"
              min={0}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            placeholder="Highlight key features, floor number, furnishing, society amenities, nearby transit..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Submit Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : propertyToEdit ? 'Save Changes' : 'Create Listing'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
