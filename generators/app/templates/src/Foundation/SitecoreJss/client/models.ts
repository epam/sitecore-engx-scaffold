export interface BaseDataSourceItem {
  id: string;
}

export interface BaseRenderingParam {
  caching?: string;
}

export interface Item<TDataSourceItem> {
  fields: TDataSourceItem;
  url: string;
}

export interface ItemList<TDataSourceItem> extends Array<Item<TDataSourceItem>> {}

export interface DictionaryItem {
  dictionary: { [key: string]: string };
}

export interface Rendering<TDataSourceItem extends BaseDataSourceItem> extends Item<TDataSourceItem> {
  actionCallback: any;
  actions?: any;
  dictionary: { [key: string]: string };
  language: any;
  rendering: any;
  routeFields: any;
  sitecoreContext: any;
}

export interface RenderingWithParams<
  TDataSourceItem extends BaseDataSourceItem,
  TParameters extends BaseRenderingParam
> extends Rendering<TDataSourceItem> {
  params: TParameters;
}

export interface Field<TFieldValue> {
  value: TFieldValue;
  editable: string;
}

export interface SiteContext {
  site: {
    name: string;
  };
}

export interface SitecoreContext<TContext> {
  context: TContext;
}

export interface SitecoreRoute<TRoute> {
  route: TRoute;
}

export interface Sitecore<TContext, TRoute> extends SitecoreContext<TContext>, SitecoreRoute<TRoute> {
  loadedUrl?: string;
}

export interface SitecorePayload extends Partial<Sitecore<{}, {}>> {}

export interface SitecoreState<TContext = {}, TRoute = {}> {
  sitecore: Sitecore<TContext, TRoute>;
}

export interface ViewBagState<TViewBag = {}> {
  viewBag: TViewBag;
}
