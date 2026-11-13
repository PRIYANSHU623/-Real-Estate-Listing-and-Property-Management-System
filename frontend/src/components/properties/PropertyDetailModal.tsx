import React, { useState } from 'react';
import { Property, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { getPropertyImages } from '../../data/curatedImages';
import { formatINR, formatDate, PROPERTY_TYPE_LABELS } from '../../utils/formatters';
import { PropertyStatusBadge } from '../common/Badge';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Calendar,
  CheckCircle,
  Shield,
  Phone,
  Mail,
  Edit,
  Trash2,
  Sparkles,
  Wifi,
  Car,
  Tv,
  Wind,
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onBook?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onRequireAuth?: () => void;
  currentUserRole?: UserRole | null;
  currentUserId?: number | null;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  onBook,
  onEdit,
  onDelete,
  onRequireAuth,
  currentUserRole,
  currentUserId,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!property) return null;

  const imageSet = getPropertyImages(property.id, property.property_type);
  const allImages = [imageSet.cover, ...imageSet.gallery];
  const isOwnerOfProperty = currentUserId === property.owner_id || currentUserRole === 'ADMIN';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="space-y-6">
        {/* Photo Gallery Header */}
        <div>
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
            <img
              src={allImages[activePhotoIdx] || imageSet.cover}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                {PROPERTY_TYPE_LABELS[property.property_type]}
              </span>
              <PropertyStatusBadge status={property.status} />
            </div>
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl text-white">
              <span className="text-2xl font-black">{formatINR(property.rent)}</span>
              <span className="text-xs text-slate-300 ml-1">/ month</span>
            </div>
          </div>

          {/* Thumbnail row */}
          <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative w-20 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  activePhotoIdx === idx
                    ? 'border-emerald-600 scale-105 shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Title & Location Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
            <MapPin className="w-4 h-4" />
            <span>{property.address}, {property.city}, {property.state} — {property.pincode}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {property.title}
          </h2>
        </div>

        {/* Core Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <Bed className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
            <div className="text-xs text-slate-500 font-medium">Bedrooms</div>
            <div className="text-sm font-bold text-slate-800">{property.bedrooms} BHK</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <Bath className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
            <div className="text-xs text-slate-500 font-medium">Bathrooms</div>
            <div className="text-sm font-bold text-slate-800">{property.bathrooms} Baths</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <Maximize2 className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
            <div className="text-xs text-slate-500 font-medium">Super Area</div>
            <div className="text-sm font-bold text-slate-800">{property.area ? `${property.area} sqft` : 'N/A'}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <Shield className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
            <div className="text-xs text-slate-500 font-medium">Deposit</div>
            <div className="text-sm font-bold text-slate-800">{formatINR(property.rent * 2)} (2 mo)</div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">About this Property</h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {property.description ||
              `Experience comfortable living in this spacious ${property.bedrooms} BHK ${PROPERTY_TYPE_LABELS[property.property_type]}. Featuring sunlit rooms, modern fittings, high ventilation, and prompt landlord support. Close to transportation, markets, schools, and IT hubs in ${property.city}.`}
          </p>
        </div>

        {/* Premium Amenities Checklist */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Included Amenities</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> 24/7 Water & Power Backup
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
              <Car className="w-4 h-4 text-emerald-600" /> Dedicated Covered Parking
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
              <Wifi className="w-4 h-4 text-emerald-600" /> Fiber Internet Ready
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
              <Wind className="w-4 h-4 text-emerald-600" /> Cross Ventilation & Balcony
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
              <Shield className="w-4 h-4 text-emerald-600" /> Gated Society & CCTV
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
              <Sparkles className="w-4 h-4 text-emerald-600" /> In-house Maintenance Support
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Listed on {formatDate(property.created_at)}
          </div>

          <div className="flex items-center gap-2">
            {isOwnerOfProperty ? (
              <>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(property);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Edit Property
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDelete(property);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </>
            ) : currentUserRole === 'TENANT' ? (
              property.status === 'AVAILABLE' ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBook?.(property);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:shadow-lg"
                >
                  <Calendar className="w-4 h-4" /> Request Booking / Schedule Visit
                </button>
              ) : (
                <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
                  Property is currently {property.status.toLowerCase()}
                </div>
              )
            ) : !currentUserRole ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequireAuth?.();
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
              >
                Sign In to Book This Property
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  );
};
