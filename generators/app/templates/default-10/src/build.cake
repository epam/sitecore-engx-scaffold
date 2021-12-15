#tool nuget:?package=NuGet.CommandLine&version=5.11.0
#tool nuget:?package=xunit.runner.console&version=2.4.1
#tool nuget:?package=OpenCover&version=4.7.1221
#tool nuget:?package=OpenCoverToCoberturaConverter&version=0.3.4
#tool nuget:?package=ReportGenerator&version=4.8.13

var sname = "<%= solutionX %>";
var target = Argument("target", "Default");
var sln = $"{sname}.sln";
var dockerConf = "<%= dockerX %>";

Task("000-Clean")
	.Does(() => CleanDirectory($"../docker/{dockerConf}/deploy"));

Task("001-Restore")
	.Does(() => NuGetRestore(sln));

Task("002-Build")
	.Does(() => MSBuild(sln, conf => conf
		.SetConfiguration("Debug")
		.UseToolVersion(MSBuildToolVersion.VS2019)
		.SetVerbosity(Verbosity.Minimal)
		));

Task("003-Tests")
	.Does(() => {
		var settings = new OpenCoverSettings {
			SkipAutoProps = true,
			Register = "XUNIT_TESTS_COVERAGE_REGISTER",
			MergeByHash = true,
			NoDefaultFilters = true,
			ReturnTargetCodeOffset = 0
		}
		.WithFilter($"+[{sname}.*]*")
		.WithFilter($"-[{sname}.*.Tests*]*");
		
		var _directories = GetDirectories(
            "./**/bin",
            new GlobberSettings {
                Predicate = fileSystemInfo => fileSystemInfo.Path.FullPath.IndexOf("node_modules", StringComparison.OrdinalIgnoreCase) < 0
            });
        foreach (var directory in _directories)
        {
            settings.SearchDirectories.Add(directory);
        }

		var _openCoverResultsFilePath = new FilePath("../TestResults/coverage.xml");

		OpenCover(tool => tool.XUnit2("./**/bin/*Tests.dll", new XUnit2Settings {
			XmlReport = true,
			Parallelism = ParallelismOption.All,
			NoAppDomain = false,
			OutputDirectory = "../TestResults",
			ReportName = "xUnitTestResults",
		}),
			_openCoverResultsFilePath,
			settings
		);

		ReportGenerator(_openCoverResultsFilePath, "../TestResults/report");

        var _converterExecutablePath = Context.Tools.Resolve("OpenCoverToCoberturaConverter.exe");
        StartProcess(_converterExecutablePath, new ProcessSettings {
            Arguments = new ProcessArgumentBuilder()
                .Append($"-input:\"{_openCoverResultsFilePath}\"")
                .Append("-output:\"../TestResults/cobertura-coverage.xml\"")
        });
	});

Task("004-Publish-Foundation")
	.Does(() => {
		var projects = GetFiles("./Foundation/**/website/*.csproj");//Add project type GUID check
		foreach(var project in projects)
		{
			MSBuild(project, conf => conf
				.SetConfiguration("Debug")
				.UseToolVersion(MSBuildToolVersion.VS2019)
				.SetVerbosity(Verbosity.Minimal)
				.WithTarget("Build")
				.WithProperty("DeployOnBuild", "true")
				.WithProperty("DeployDefaultTarget", "WebPublish")
				.WithProperty("DeleteExistingFiles", "False")
				.WithProperty("ExcludeApp_Data", "False")
				.WithProperty("LaunchSiteAfterPublish", "False")
				.WithProperty("PublishProvider", "FileSystem")
				.WithProperty("PublishUrl", $"..\\..\\..\\..\\docker\\{dockerConf}\\deploy")
				.WithProperty("WebPublishMethod", "FileSystem")
				.WithProperty("_FindDependencies", "false")
			);
		}
	});

Task("004-Publish-Feature")
	.Does(() => {
		var projects = GetFiles("./Feature/**/website/*.csproj");//Add project type GUID check
		foreach(var project in projects)
		{
			MSBuild(project, conf => conf
				.SetConfiguration("Debug")
				.UseToolVersion(MSBuildToolVersion.VS2019)
				.SetVerbosity(Verbosity.Minimal)
				.WithTarget("Build")
				.WithProperty("DeployOnBuild", "true")
				.WithProperty("DeployDefaultTarget", "WebPublish")
				.WithProperty("DeleteExistingFiles", "False")
				.WithProperty("ExcludeApp_Data", "False")
				.WithProperty("LaunchSiteAfterPublish", "False")
				.WithProperty("PublishProvider", "FileSystem")
				.WithProperty("PublishUrl", $"..\\..\\..\\..\\docker\\{dockerConf}\\deploy")
				.WithProperty("WebPublishMethod", "FileSystem")
				.WithProperty("_FindDependencies", "false")
			);
		}
	});

Task("004-Publish-Project")
	.Does(() => {
		var projects = GetFiles("./Project/**/website/*.csproj");//Add project type GUID check
		foreach(var project in projects)
		{
			MSBuild(project, conf => conf
				.SetConfiguration("Debug")
				.UseToolVersion(MSBuildToolVersion.VS2019)
				.SetVerbosity(Verbosity.Minimal)
				.WithTarget("Build")
				.WithProperty("DeployOnBuild", "true")
				.WithProperty("DeployDefaultTarget", "WebPublish")
				.WithProperty("DeleteExistingFiles", "False")
				.WithProperty("ExcludeApp_Data", "False")
				.WithProperty("LaunchSiteAfterPublish", "False")
				.WithProperty("PublishProvider", "FileSystem")
				.WithProperty("PublishUrl", $"..\\..\\..\\..\\docker\\{dockerConf}\\deploy")
				.WithProperty("WebPublishMethod", "FileSystem")
				.WithProperty("_FindDependencies", "false")
			);
		}
	});

Task("004-Publish")
	.IsDependentOn("004-Publish-Foundation")
	.IsDependentOn("004-Publish-Feature")
	.IsDependentOn("004-Publish-Project");

Task("005-Sync-Content")
	.Does(() => { DotNetCoreTool("sitecore ser push"); });

Task("Default") // LocalDev
    .IsDependentOn("000-Clean")
	.IsDependentOn("001-Restore")
	.IsDependentOn("002-Build")
	.IsDependentOn("003-Tests")
	.IsDependentOn("004-Publish")
	.IsDependentOn("005-Sync-Content")
	;

Task("Build-and-Publish") // LocalDev
    .IsDependentOn("002-Build")
    .IsDependentOn("004-Publish");

RunTarget(target);