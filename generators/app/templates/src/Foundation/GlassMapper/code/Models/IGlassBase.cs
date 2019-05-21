using System;
using System.Collections.Generic;
using Glass.Mapper.Sc.Configuration;
using Glass.Mapper.Sc.Configuration.Attributes;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;

namespace <%= solutionX %>.Foundation.GlassMapper.Models
{
    public interface IGlassBase
    {
        [SitecoreId]
        Guid Id { get; }

        [SitecoreInfo(SitecoreInfoType.Name)]
        string Name { get; set; }

        [SitecoreItem]
        Item Item { get; }

        [SitecoreParent]
        Item Parent { get; }

        [SitecoreChildren]
        IEnumerable<Item> Children { get; }

        [SitecoreInfo(SitecoreInfoType.Language)]
        Language Language { get; }

        [SitecoreInfo(SitecoreInfoType.Version)]
        int Version { get; }

        [SitecoreInfo(SitecoreInfoType.Url)]
        string Url { get; }

        [SitecoreInfo(SitecoreInfoType.BaseTemplateIds)]
        IEnumerable<Guid> BaseTemplateIds { get; }

        [SitecoreInfo(SitecoreInfoType.TemplateId)]
        Guid ItemTemplateId { get; }

        bool InheritsTemplate(Guid templateGuid);

        bool InheritsTemplate(ID templateId);
    }
}
