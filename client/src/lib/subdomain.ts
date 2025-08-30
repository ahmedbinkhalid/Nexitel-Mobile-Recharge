// Subdomain detection and routing utilities

export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Handle Replit domains
  if (hostname.includes('.replit.dev') || hostname.includes('.replit.app')) {
    // For Replit domains, check URL parameters for subdomain simulation
    const urlParams = new URLSearchParams(window.location.search);
    const subdomainParam = urlParams.get('subdomain');
    if (subdomainParam) {
      return subdomainParam;
    }
    return null;
  }
  
  // Handle custom domains
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  
  return null;
}

export function isCustomerPortal(): boolean {
  const subdomain = getSubdomain();
  return subdomain === 'customer' || subdomain === 'customers' || subdomain === 'portal';
}

export function redirectToSubdomain(subdomain: string, path: string = '/') {
  if (typeof window === 'undefined') return;
  
  const hostname = window.location.hostname;
  
  // For development and Replit domains, use query parameter
  if (hostname === 'localhost' || hostname === '127.0.0.1' || 
      hostname.includes('.replit.dev') || hostname.includes('.replit.app')) {
    const baseUrl = `${window.location.protocol}//${hostname}${window.location.port ? ':' + window.location.port : ''}`;
    window.location.href = `${baseUrl}${path}?subdomain=${subdomain}`;
  } else {
    // For custom domains, use actual subdomain
    const newHostname = `${subdomain}.${hostname}`;
    window.location.href = `${window.location.protocol}//${newHostname}${path}`;
  }
}

export function redirectToMainDomain(path: string = '/') {
  if (typeof window === 'undefined') return;
  
  const hostname = window.location.hostname;
  
  // For development and Replit domains, remove query parameter
  if (hostname === 'localhost' || hostname === '127.0.0.1' || 
      hostname.includes('.replit.dev') || hostname.includes('.replit.app')) {
    const baseUrl = `${window.location.protocol}//${hostname}${window.location.port ? ':' + window.location.port : ''}`;
    window.location.href = `${baseUrl}${path}`;
  } else {
    // For custom domains, go to main domain
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const mainDomain = parts.slice(1).join('.');
      window.location.href = `${window.location.protocol}//${mainDomain}${path}`;
    }
  }
}