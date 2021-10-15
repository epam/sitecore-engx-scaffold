using System.Web.Http;

namespace <%= solutionX %>.Foundation.DependencyInjection
{
    public class TestController: ApiController
    {
        [HttpGet]
        [Route("test")]
        public IHttpActionResult Test()
        { 
            return Json("Test");
        }
    }
}