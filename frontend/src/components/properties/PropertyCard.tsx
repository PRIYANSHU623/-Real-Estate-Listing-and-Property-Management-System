import React from 'react';
import { Property, UserRole } from '../../types';
import { getPropertyImages } from '../../data/curatedImages';
import { formatINR, PROPERTY_TYPE_LABELS } from '../../utils/formatters';
import { PropertyStatusBadge } from '../common/Badge';
import { Bed, Bath, Maximize2, MapPin, Eye, Calendar, Sparkles } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onBook?: (property: Property) => void;
  userRole?: UserRole | null;
  isOwner?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onBook,
  userRole,
  isOwner,
}) => {
  const images = getPropertyImages(property.id, property.property_type);

  return (
    <div
      onClick={() => onSelect(property)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Property Image Header */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={images.cover}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
            {PROPERTY_TYPE_LABELS[property.property_type] || property.property_type}
          </span>
          <div className="pointer-events-auto">
            <PropertyStatusBadge status={property.status} />
          </div>
        </div>

        {/* Rent Tag on image */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md">
            {formatINR(property.rent)}
            <span className="text-xs font-medium text-slate-200 ml-1">/ month</span>
          </div>
        </div>
      </div>

      {/* Property Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate font-medium">{property.city}, {property.state}</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-mono text-slate-400">{property.pincode}</span>
          </div>

          <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {property.title}
          </h3>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {property.description || `${property.bedrooms} BHK ${PROPERTY_TYPE_LABELS[property.property_type]} with premium amenities, located in prime ${property.city}.`}
          </p>
        </div>

        {/* Specs Pill row */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 font-medium" title={`${property.bedrooms} Bedrooms`}>
              <Bed className="w-4 h-4 text-slate-400" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1 font-medium" title={`${property.bathrooms} Bathrooms`}>
              <Bath className="w-4 h-4 text-slate-400" />
              <span>{property.bathrooms} Baths</span>
            </div>
            {property.area && (
              <div className="flex items-center gap-1 font-medium" title={`${property.area} Sq Ft`}>
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.area} sqft</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Action footer */}
        <div className="mt-3.5 pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(property);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-slate-200"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>

          {property.status === 'AVAILABLE' && onBook && userRole === 'TENANT' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBook(property);
              }}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" /> Book
            </button>
          )}

          {isOwner && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
              Your Listing
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
