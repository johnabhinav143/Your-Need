import {
  Droplets,
  Fan,
  Filter,
  Flame,
  Hammer,
  Refrigerator,
  Tv,
  Waves,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';
import { ApplianceCategory } from '../types';

export function CategoryIcon({
  category,
  className = 'w-5 h-5',
}: {
  category: ApplianceCategory;
  className?: string;
}) {
  switch (category) {
    case 'fan':
      return <Fan className={className} />;
    case 'ac':
      return <Wind className={className} />;
    case 'fridge':
      return <Refrigerator className={className} />;
    case 'washing_machine':
      return <Waves className={className} />;
    case 'electrical':
      return <Zap className={className} />;
    case 'microwave':
      return <Flame className={className} />;
    case 'geyser':
      return <Droplets className={className} />;
    case 'tv_electronics':
      return <Tv className={className} />;
    case 'water_purifier':
      return <Filter className={className} />;
    case 'plumbing':
      return <Droplets className={className} />;
    case 'carpentry':
      return <Hammer className={className} />;
    default:
      return <Wrench className={className} />;
  }
}
