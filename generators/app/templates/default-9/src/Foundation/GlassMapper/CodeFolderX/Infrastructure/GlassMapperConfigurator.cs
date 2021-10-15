namespace <%= solutionX %>.Foundation.GlassMapper.Infrastructure
{
    using Glass.Mapper.Sc;
    using Glass.Mapper.Sc.Web;
    using Glass.Mapper.Sc.Web.Mvc;

    using Microsoft.Extensions.DependencyInjection;

    using Sitecore.DependencyInjection;

    public class GlassMapperConfigurator : IServicesConfigurator
    {
        public void Configure(IServiceCollection serviceCollection)
        {
            serviceCollection.AddTransient<ISitecoreService>(provider => new SitecoreService(Sitecore.Context.Database));
            serviceCollection.AddTransient<IRequestContext>(provider => new RequestContext(provider.GetService<ISitecoreService>()));
            serviceCollection.AddTransient<IMvcContext>(provider => new MvcContext(provider.GetService<ISitecoreService>()));
            serviceCollection.AddTransient<IGlassHtml, GlassHtml>();
        }
    }
}