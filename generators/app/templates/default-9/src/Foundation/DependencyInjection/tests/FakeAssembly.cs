namespace <%= solutionX %>.Foundation.DependencyInjection.Tests
{
    using System.Reflection;
    using System.Runtime.Serialization;

    public abstract class FakeAssembly : Assembly
    {
        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
        }
    }
}
