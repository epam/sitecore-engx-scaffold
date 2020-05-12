namespace <%= solutionX %>.Foundation.DependencyInjection.Infrastructure
{
    using System.Web.Http.Controllers;
    using System.Web.Mvc;

    using Microsoft.Extensions.DependencyInjection;

    using Sitecore.DependencyInjection;

    public class DiConfigurator : IServicesConfigurator
    {
        public void Configure(IServiceCollection serviceCollection)
        {
            serviceCollection.AddControllers<IController>("*.Foundation.*");
            serviceCollection.AddControllers<IHttpController>("*.Foundation.*");
            serviceCollection.AddClassesWithServiceAttribute("*.Foundation.*");

            serviceCollection.AddControllers<IController>("*.Feature.*");
            serviceCollection.AddClassesWithServiceAttribute("*.Feature.*");
        }
    }
}