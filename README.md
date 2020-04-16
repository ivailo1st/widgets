# Colibo Widgets

(PLEASE REFER TO GITHUB FOR THE MOST RECENT EDITION)

Widgets is the way to extend Colibo with Visual or functional components. Widgets can have one of these types: 
- page-widgets (for a dashboard-style widget, etc.)
- global widgets (singletons for tracking, global alert-bars, etc.)
- sidebar widgets (shows up in the sidebar)
- search-widgets (for searching external sources)
- configuration-widgets (for configuring widget-instances)

Widgets are stand-alone clientside `webcomponents` that are instantiated with instance-configuration and have access to context. This means you are free and able to develop your widgets with whatever technology you prefer, as long as they are exposed as a webcomponent. We recommend using `shadowDOM` to avoid styling-conflicts. Please refer to the examples at the end to see different technologies applied (Angular, react, LitElement, etc.)

## Widgets are registered in Colibo with

Widgets are defined by the following fields (and can furthermore be imported/exported as a json-string/file).

-   **Name** The displayname to show inside Colibo for widget-editors
-   **Description** A short description for the editor to choose the right widget.
-	**HTMLElementName** The tagName of your custom-element. Colibo will imperatively create the instance of your webcomponent with this name. HTMLElementNames must include a dash, and we recommend using namespaces to avoid potential naming clashes (company-widget). 
-	**BundleUrl** The url to the bundle that registeres your widgets as a webcomponent. Colibo will programmatically load this script lazily the first time a users will load your component.
-   **LegacyBundleUrl** An (optional) corresponding bundle for older browsers that don't support webcomponents v1. 
-	**Type** The Type of your widget (Page, Global, Search, Configuration).
-   **InitialHeight** A pixel value for the initial height of the widget. This is a means to avoid jumping/shifting the layout when your widget loads (the value will be set as style.minHeight on the element). 
-	**Configuration-definition** Define the configuration-options for your widget as a list of type, keys, label, required, description and default-values. Use the "builder" in colibo to define your configuration. See below for details about the custom type. 
-   **Internal** (boolean) widgets that cannot be edited/deleted

### Custom configuration field widgets

This allows making custom fields that uses a webcomponent for control and logic. This field-type is meant for making fields with special editors (e.g. pick location on a map) or fields that should send information to third party (e.g. private tokens that shouldn't be passed through the frontend application).  

The element must maintain a `value`-property that holds the colibo-stored value. The element can implement a `beforeSave` method that colibo will call when the editor saves the instance. If this method returns a promise Colibo will wait for it to resolve, before saving the instance. The element is first instantiated with the current (or default when creating) value on the `value` property and an `instanceId` property (when first creating an instance, this property will be available when `beforeSave` is called). 


## Widget instances
A widget can be used in multiple instances, with different configurations. Furthermore widget-instances have `recipients` and can be `disabled`. 

### Instantiation

Colibo shows the widgets that are targeted to the individual user (and that are not disabled). 

When Colibo instantiates your widget custom-element, it will set the instance's stored configuration to the element as a property called `configuration` (string). Furthermore a corresponding `instanceId` (number) will be set. 


## Search Widgets

Search widgets are a way to add more search-capabilities to Colibo. The widget itself is responsible for showing the search-results. The widget is instantiated like page-widgets, but must also maintain a `tabName` (string) property, and `search` and `clear` methods. The search-method is called with a string of the searchword whenever a user performans a search. the search-method should return a promise that will resolve to the number that will be displayed in the tab-bar. Whenever the user clears the search, the `clear` method will be called. At instantiation-time a `simpleMode` (boolean) property will be assigned - this will be true, when your search-widget is displayed in the navigation - and false in other cases (like the detail page). We recommend showing no settings and pagination-options when in simpleMode.


## Widgets in tabs

As of today (20.2) widgets are shown in tabs for sidebar-widgets and search-widgets. These widgets must maintain a tabName (string) property that represents the name of their tab. For the sidebar, a tabIcon property replaces this need. 
For widgets displayed in tabs, Colibo will maintain an `active` (boolean) property on the widget. We suggest implementing a set'ter function and act appropriately when your widget is not active.
 
## Context

Colibo exposes a global `colibo`-object (on window), that allows widgets to know about their context, and provide some extra convenience. 

```ts
interface colibo {
    user: {
        fullName: string;
        firstName: string;
        lastName: string;
        email: string;
        id: number;
        departmentId: number;
    };
    cultureName: string;
    theme: {
        primaryColor: string
    }; 
    version: string;

    pageType: string; ("Home" | "Document" | "Group" | "GroupFeed" | "GroupPosts" | "GroupNews" | "GroupEvents" | "GroupMembers" | "Unknown")
    
    event$: Observable<{ type: string; data: any }>;

    helpers: {

        aquireGraphToken: (resource: string) => Promise<{ expires: Date, value: string }>;

        formatDate: (date: string | Date, dateFormat?: string) => string;
        
        httpClient: AngularHttpClient;

        http: {
            get: (url: string) => Promise<Response>,
            post: (url: string, body: any) => Promise<Response>
        }
        
        navigate: (url: string) => Promise<any>;
    
    }

    idToken: string; /* coming soon... */
}
```

A couple of these might require a little elaboration. 

- **event$** is a ([RxJS](https://rxjs-dev.firebaseapp.com/)) stream of platform events. The observable have a `subscribe` method on it, that notifies a callback function for each platform event. These platform events all have `type` and `data` properties, and can optionally have a `customData` property as well. Subscribe for navigation-, behaviour-, timing events and more. 
- **helpers** contains a number of helper functions:
  - **aquireGraphToken** is a method to easily get the appropriate token for the users access to a given resource
  - **formatDate** can be used to format strings or dates using the correct locale. Using DateFNS formatting: (https://date-fns.org/v2.8.1/docs/format)
  - **httpClient** is a reference to an instance of the Angular [httpClient](https://angular.io/api/common/http/HttpClient). Use these to achieve authorized access to Colibo-services, and to have a convenient way to do http-requests (without needing polyfills for legacy browsers).
  - **http** is an object that contains references to the httpClient method of the same name. 
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

To enable a card-design for your widget, you can add a `clb-widget-card` className to your element. 

## Polyfilling (browser support)
Webcomponent-support is pretty broad (see [caniuse](https://caniuse.com/#feat=custom-elementsv1)). For legacy browsers that don't support the entire spec, Colibo conditionally loads the needed [polyfills](https://www.npmjs.com/package/@webcomponents/webcomponentsjs) once, so you don't have to deal with it.

## Examples
Below is a set of example-widgets. They are built with different technologies, and can serve as inspiration or as a getting-started guide. 

### Release Status widget
Displays a list of Epics in the current sub-iteration (Release), and how many children exists/are done.

**Technology**: LitElement

**Source**: See on [MS devops](https://colibo.visualstudio.com/Colibo/_git/widget.release-status)
-------- MOVE TO GITHUB ----------

**Configuration**: 

```json
[{ 
    "key": "apiUrl",
    "type": "string",
    "label": "Api url",
    "description": "The url to the api",
    "defaultValue": "https://releasewidget.azurewebsites.net/api/releasestatus"
},{
    "key": "header",
    "type": "string",
    "label": "Widget header",
    "description": "The header shown above the epics",
    "defaultValue": "Release status"
}]
```

### Facebook Widget (later)
Displays posts from a given facebook group

**Technology**: VueJS

**Source**: [INSERT GITHUB-LINK] 

**Configuration**: 

```json
[{ 
    "key": "facebookConfiguration",
    "type": "custom",
    "label": "Facebook configuration",
    "description": "The url to the rss-feed",
    "elementName": "facebook-configuration",
    "bundleUrl": "http://cdn/file.js",
    "defaultValue": "{}"
},{
    "key": "header",
    "type": "string",
    "label": "Widget header",
    "description": "The header shown above the posts",
    "defaultValue": "Latest news"
}]
```

### Weather Widget (later)
Displays the weather for a given location

**Technology**: Angular

**Source**: [INSERT GITHUB-LINK] 

**Configuration**: 

```json
[{ 
    "key": "coordinates",
    "type": "custom",
    "label": "Location",
    "description": "Choose your location on the map",
    "elementName": "select-location",
    "bundleUrl": "http://cdn/file2.js",
    "defaultValue": "{lat:0, lng:0}"
},{
    "key": "header",
    "type": "string",
    "label": "Widget header",
    "description": "The header shown above the posts",
    "defaultValue": "Latest news"
}]
```

## iFrame Widget (later)
Displays an iFrame with whatever content anybody could want. 

**Technology**: React

**Source**: [INSERT GITHUB-LINK] 

**Configuration**: 

```json
[{ 
    "key": "url",
    "type": "string",
    "label": "iframe-url",
    "description": "The url to the iframes content",
    "defaultValue": "https://airhorner.com/"
}]
```

