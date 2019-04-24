namespace <%= solutionX %>.<%= moduleTypeX %>.<%= moduleNameX %>.Tests
{
    using Sitecore.FakeDb;

    using Xunit;

    public class SimpleTest
    {
        [Fact]
        public void CreatingHierarchyOfItems()
        {
            using (
                var db = new Db
                             {
                                 new DbItem("Articles")
                                     {
                                         new DbItem("Getting Started"),
                                         new DbItem("Troubleshooting")
                                     }
                             })
            {
                var articles = db.GetItem("/sitecore/content/Articles");

                Assert.NotNull(articles.Children["Getting Started"]);
                Assert.NotNull(articles.Children["Troubleshooting"]);
            }
        }

        [Fact]
        public void CreatingSimpleItem()
        {
            using (var db = new Db { new DbItem("Home") { { "Title", "Welcome!" } } })
            {
                var home = db.GetItem("/sitecore/content/home");
                Assert.Equal("Welcome!", home["Title"]);
            }
        }
    }
}