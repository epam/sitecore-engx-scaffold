namespace <%= solutionX %>.Foundation.DependencyInjection.Tests
{
    using Microsoft.Extensions.DependencyInjection;

    using NSubstitute;

    using <%= solutionX %>.Foundation.DependencyInjection;

    using Xunit;

    public class ServiceCollectionExtensionsTests
    {
        [Fact]
        public void AddClassesWithServiceAttribute_TypesWithServiceRegistration_ServicesCollectionIsConfigured()
        {
            IServiceCollection serviceCollection = new ServiceCollection();

            var interfaceType = typeof(AddClassesWithServiceAttributeTestClasses.InterfaceClass);
            var implementationType = typeof(AddClassesWithServiceAttributeTestClasses.ImplementationClass);

            var selfRegistratingType = typeof(AddClassesWithServiceAttributeTestClasses.SelfRegistratingClass);

            var assembly = Substitute.For<FakeAssembly>();
            assembly.ExportedTypes.Returns(new[] { interfaceType, implementationType, selfRegistratingType });
            assembly.GetExportedTypes().Returns(x => assembly.ExportedTypes);

            serviceCollection.AddClassesWithServiceAttribute(assembly);

            Assert.Equal(2, serviceCollection.Count);

            Assert.Contains(serviceCollection, x => x.ImplementationType == implementationType && x.Lifetime == ServiceLifetime.Singleton);
            Assert.Contains(serviceCollection, x => x.ServiceType == interfaceType && x.Lifetime == ServiceLifetime.Singleton);

            Assert.Contains(serviceCollection, x => x.ImplementationType == selfRegistratingType && x.Lifetime == ServiceLifetime.Transient);
            Assert.Contains(serviceCollection, x => x.ServiceType == selfRegistratingType && x.Lifetime == ServiceLifetime.Transient);
        }

        [Theory]
        [InlineData("*AnotherSimpleTestClass")]
        [InlineData("*Another*")]
        [InlineData("<%= solutionX %>.*Another*")]
        public void AddByWildcard_ValidTypes_ServicesCollectionWihtMathingType(string pattern)
        {
            IServiceCollection serviceCollection = new ServiceCollection();

            var simpleTestClassType = typeof(AddByWildcardTestClasses.SimpleTestClass);
            var anotherSimpleTestClassType = typeof(AddByWildcardTestClasses.AnotherSimpleTestClass);

            var assembly = Substitute.For<FakeAssembly>();
            assembly.ExportedTypes.Returns(new[] { simpleTestClassType, anotherSimpleTestClassType });
            assembly.GetExportedTypes().Returns(x => assembly.ExportedTypes);

            serviceCollection.AddByWildcard(Lifetime.Singleton, pattern, assembly);

            Assert.Equal(1, serviceCollection.Count);

            Assert.Contains(serviceCollection, x => x.ImplementationType == anotherSimpleTestClassType && x.Lifetime == ServiceLifetime.Singleton);
            Assert.Contains(serviceCollection, x => x.ServiceType == anotherSimpleTestClassType && x.Lifetime == ServiceLifetime.Singleton);
        }

        private static class AddClassesWithServiceAttributeTestClasses
        {
            public class InterfaceClass
            {
            }

            [Service(typeof(InterfaceClass), Lifetime = Lifetime.Singleton)]
            public class ImplementationClass : InterfaceClass
            {
            }

            [Service(Lifetime = Lifetime.Transient)]
            public class SelfRegistratingClass
            {
            }
        }

        private static class AddByWildcardTestClasses
        {
            public class SimpleTestClass
            {
            }

            public class AnotherSimpleTestClass
            {
            }
        }
    }
}