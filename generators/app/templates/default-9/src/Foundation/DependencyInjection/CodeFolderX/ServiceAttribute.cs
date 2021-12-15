﻿namespace <%= solutionX %>.Foundation.DependencyInjection
{
    using System;

    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public class ServiceAttribute : Attribute
    {
        public ServiceAttribute()
        {
        }

        public ServiceAttribute(Type serviceType)
        {
            this.ServiceType = serviceType;
        }

        public Lifetime Lifetime { get; set; } = Lifetime.Singleton;

        public Type ServiceType { get; set; }
    }
}