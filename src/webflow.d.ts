// src/webflow.d.ts
declare namespace Webflow {
    interface Location {
      href: string;
      hash: string;
      host: string;
      hostname: string;
      pathname: string;
      protocol: string;
      port: string;
      search: string;
    }
  
    interface Window {
      location: Location;
    }
  
    interface Api {
      ready(): void;
      destroy(): void;
      render(): void;
    }
  }
  
  declare const Webflow: Webflow.Api;