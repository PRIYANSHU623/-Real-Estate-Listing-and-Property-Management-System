import React from 'react';
import { Building2, Shield, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">Estate<span className="text-emerald-600">Hub</span></span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Real Estate Listing & End-to-End Property Management platform for landlords, tenants, and administrators.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>JWT Secured & Razorpay Integrated</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/" className="hover:text-emerald-600">Browse Properties</Link></li>
              <li><Link to="/?city=Mumbai" className="hover:text-emerald-600">Mumbai Rentals</Link></li>
              <li><Link to="/?city=Bengaluru" className="hover:text-emerald-600">Bengaluru Homes</Link></li>
              <li><Link to="/?property_type=VILLA" className="hover:text-emerald-600">Luxury Villas</Link></li>
            </ul>
          </div>

          {/* Platform capabilities */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform Features</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Lease Agreements & Tracking</li>
              <li>Razorpay Online Rent Collection</li>
              <li>Maintenance Ticketing & Vendor Dispatch</li>
              <li>Portfolio Analytics & Occupancy Rates</li>
            </ul>
          </div>

          {/* System API Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">API & Docs</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-600">
                  Swagger UI Docs <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="http://localhost:8000/redoc" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-600">
                  ReDoc API Spec <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="http://localhost:8000/health" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-600">
                  API Health Status <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} EstateHub PMS. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with Vite, React, TypeScript & FastAPI
          </p>
        </div>
      </div>
    </footer>
  );
};
