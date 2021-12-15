using System;
using System.Collections.Generic;
using System.Linq;
using Glass.Mapper.Sc.Configuration;
using Glass.Mapper.Sc.Configuration.Attributes;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;

namespace <%= solutionX %>.Foundation.GlassMapper.Models
{
    public abstract class GlassBase : IGlassBase
    {
        [SitecoreId]
        public virtual Guid Id { get; set; }

        [SitecoreInfo(SitecoreInfoType.Name)]
        public virtual string Name { get; set; }

        [SitecoreItem]
        public virtual Item Item { get; set; }

        [SitecoreParent]
        public virtual Item Parent { get; set; }

        [SitecoreChildren]
        public virtual IEnumerable<Item> Children { get; set; }

        [SitecoreInfo(SitecoreInfoType.Language)]
        public virtual Language Language { get; set; }

        [SitecoreInfo(SitecoreInfoType.Version)]
        public virtual int Version { get; set; }

        [SitecoreInfo(SitecoreInfoType.Url)]
        public virtual string Url { get; set; }

        [SitecoreInfo(SitecoreInfoType.BaseTemplateIds)]
        public virtual IEnumerable<Guid> BaseTemplateIds { get; set; }

        [SitecoreInfo(SitecoreInfoType.TemplateId)]
        public virtual Guid ItemTemplateId { get; set; }

        public virtual bool InheritsTemplate(Guid templateGuid)
        {
            if (!this.BaseTemplateIds.Contains(templateGuid))
                return this.ItemTemplateId.Equals(templateGuid);

            return true;
        }

        public virtual bool InheritsTemplate(ID templateId)
        {
            return this.InheritsTemplate(templateId.Guid);
        }
    }
}
