# Colibo Widgets

Widgets are the way to extend Colibo with visual or functional components. Widgets are allowed on one or more of these locations
- Home (on the frontpage - above the feed)
- Global (long-running instance along with entire SPA)
- Sidebar (in its own tab)
- Search (in its own search-tab)
- UserProfile (on the profile page)

Widgets are stand-alone clientside `webcomponents` that are instantiated with instance-configuration and local and global context. This means you are free to develop your widget(s) with whatever technology you prefer, as long as they are exposed as a webcomponent. We recommend using `shadowDOM` to avoid styling-conflicts with Colibo, but don't enforce this. Please refer to the examples at the end of this page to see different technologies applied (Angular, react, LitElement, etc.)

## Widgets are registered in Colibo with

Widgets are defined by the following fields (and can furthermore be imported/exported as a json-string/file).

-   **Name** The displayname to show inside Colibo for widget-editors
-   **Description** A short description for the editor to choose the right widget.
-	**HTMLElementName** The tagName of your custom-element. Colibo will imperatively create the instance of your webcomponent with this name. HTMLElementNames must include a dash, and we recommend using namespaces to avoid potential naming clashes (company-widget). 
-	**BundleUrl** The url to the bundle that registeres your widgets as a webcomponent. Colibo will programmatically load this script lazily the first time a users will load your component.
-   **LegacyBundleUrl** An (optional) corresponding bundle for older browsers that don't support webcomponents v1. 
-	**AllowedLocations** A list of allowed locations (see above)
-   **InitialHeight** A pixel value for the initial height of the widget. This is a means to avoid jumping/shifting the layout when your widget loads (the value will be set as style.minHeight on the element). 
-	**Configuration-definition** Define the configuration-options for your widget as a (nested) list of type, keys, label, required, description and default-values. Use the "builder" in colibo to define your configuration. See below for details about the custom type.


## Widget instances
A widget can be used in multiple instances, with different configurations. Furthermore widget-instances each have `recipients` and can be `disabled`. 

### Instantiation

For all widget-locations, Colibo will initiate the widgets that are targeted to the user (and that are not disabled). 

When Colibo instantiates your widget custom-element, it will set the instance's stored configuration to the element as a property called `configuration` (string). The appropriate `locationType` (see above), optional `locationContextId` (number) and `instanceId` (number) will also be set. 

## Special Widget types

## Search Widgets

Search widgets are the way to add more search-capabilities to Colibo. The widget itself is responsible for showing the search-results. The widget must implement `search` and `clear` methods. The search-method is called with a string of the searchword whenever a user performans a search. The search-method should return a promise that will resolve to the number that will be displayed in the tab-bar. Whenever the user clears the search, the `clear` method will be called. At instantiation-time an additional `simpleMode` (boolean) property will be assigned - this will be true, when your search-widget is displayed in the navigation - and false in other cases (like the advanced search page). We recommend showing no settings and pagination-options when in simpleMode. Search widgets are displayed in tabs - see additional information below. 

## Widgets in tabs

For some locations widgets are shown in tabs (currently Search and Sidebar). These widgets must maintain a `tabName` (string) property that represents the name of their tab. In the Sidebar, a `icon` property (for an svg) replaces this need. 
For widgets displayed in tabs, Colibo will maintain an `active` (boolean) property on the widget. We suggest implementing a set'ter function and act appropriately when your widget is not active.


### Custom configuration field widgets

This allows making custom fields that uses a webcomponent for control and logic. This field-type is meant for making fields with special editors (e.g. pick location on a map) or fields that should send information to third party (e.g. private tokens that shouldn't be passed through the frontend application).

The element must maintain a `value`-property that holds the colibo-stored value. The element can implement a `beforeSave` method that colibo will call when the editor saves the instance. If this method returns a promise Colibo will wait for it to resolve, before saving the instance. The element is instantiated with the current value on the `value` property and an `instanceId` property. When creating a new instance, the `instanceId` property will be available when `beforeSave` is called. 

When defining your custom-configuration widget (in the widget's configuration-definition), you can optionally set an element-configuration, that will act as the instance's configuration (being instantiated on the `configuration` property). 


## Context

Colibo exposes a global `colibo`-object (on window), that allows widgets to know about the current context, and provide some extra convenience. 

```ts
interface colibo {
    user: {
        departmentId: number;
        email: string;
        firstName: string;
        id: number;
        lastName: string;
    };
    cultureName: string;
    theme: {
        primaryColor: string;
        darkPrimaryColor: string;
    }; 
    version: string;

    pageType: string; ("Home" | "Document" | "Group" | "GroupFeed" | "GroupPosts" | "GroupNews" | "GroupEvents" | "GroupMembers" | "Unknown")
    
    event$: Observable<{ type: string; data: any }>;

    helpers: {

        addGraphResouce: (resource: string) => void;

        formatDate: (date: string | Date, dateFormat?: string) => string;

        http: {
            get: (url: string) => Promise<Response>,
            post: (url: string, body: any) => Promise<Response>
        }

        httpClient: AngularHttpClient;
        
        navigate: (url: string) => Promise<any>;
    
    }
}
```

A couple of these might require a little elaboration. 

- **event$** is a ([RxJS](https://rxjs-dev.firebaseapp.com/)) stream of platform events. The observable have a `subscribe` method on it, that notifies a callback function for each platform event. These platform events all have `type` and `data` properties, and can optionally have a `customData` property as well. Subscribe for navigation-, behaviour-, timing events and more. 
- **helpers** contains a number of helper functions:
  - **addGraphResouce** is a method to add a MS graph resource that Colibo will automatically authenticate for you 
  - **formatDate** can be used to format strings or dates using the correct locale. Using DateFNS formatting: (https://date-fns.org/v2.8.1/docs/format)
  - **http** is an object that contains references to the httpClient method of the same name. 
  - **httpClient** is a reference to an instance of the Angular [httpClient](https://angular.io/api/common/http/HttpClient). Use these to achieve authorized access to Colibo-services, and to have a convenient way to do http-requests (without needing polyfills for legacy browsers).
  - **navigate** is a method that navigates to a url with out clientside router

## Styling
To ensure a consistent layout, colibo publishes a set of css custom-properties to use in your widget. This way you can make sure that your widgets aligns visually with other types of colibo-content, and acts responsively to the viewport-size.

```css
    --colibo-padding: valueWithUnit;
    --colibo-font-family: fontFamilyName;
    --colibo-font-size: valueWithUnit;
    --colibo-line-height: valueWithUnit;
    --colibo-header-font-size: valueWithUnit;
    --colibo-primary-color: colorValue;
```

To enable a card-design for your widget, you can add a `clb-widget` className to your element. 

## Polyfilling (browser support)
Webcomponent-support is pretty broad (see [caniuse](https://caniuse.com/#feat=custom-elementsv1)). For legacy browsers that don't support the entire spec, Colibo conditionally loads the needed [polyfills](https://www.npmjs.com/package/@webcomponents/webcomponentsjs) once, so you don't have to deal with it.

## Examples

*Examples will follow*
