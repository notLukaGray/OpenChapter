import Link from 'next/link';
import { BreadcrumbItem } from '../lib/breadcrumbs';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({
  breadcrumbs,
  className = '',
}: BreadcrumbsProps) {
  return (
    <nav
      className={`text-sm text-gray-600 ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={item.url} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            {index === breadcrumbs.length - 1 ? (
              // Current page - no link
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.name}
              </span>
            ) : (
              // Link to other pages
              <Link
                href={item.url}
                className="hover:text-gray-900 transition-colors duration-200"
                title={item.keywords?.join(', ')}
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
