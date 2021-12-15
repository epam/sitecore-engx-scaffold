﻿// //////////////////////////////////////////////////
// Dependencies
// //////////////////////////////////////////////////
#tool nuget:?package=Cake.Sitecore&prerelease
#load nuget:?package=Cake.Sitecore&prerelease

// //////////////////////////////////////////////////
// Arguments
// //////////////////////////////////////////////////
var Target = ArgumentOrEnvironmentVariable("target", "", "Default");

// //////////////////////////////////////////////////
// Prepare
// //////////////////////////////////////////////////

Sitecore.Constants.SetNames();
Sitecore.Parameters.InitParams(
    context: Context,
    msBuildToolVersion: MSBuildToolVersion.Default,
    supportHelix20: "<%= supportHelix20X %>",
    solutionName: "<%= solutionX %>",
    scSiteUrl: "http://sc9.local", // default URL exposed from the box
    unicornSerializationRoot: "unicorn-<%= solutionUriX %>"
);

// //////////////////////////////////////////////////
// Tasks
// //////////////////////////////////////////////////

Task("000-Clean")
    .IsDependentOn(Sitecore.Tasks.ConfigureToolsTaskName)
    .IsDependentOn(Sitecore.Tasks.CleanWildcardFoldersTaskName)
    ;

Task("001-Restore")
    .IsDependentOn(Sitecore.Tasks.RestoreNuGetPackagesTask)
    .IsDependentOn(Sitecore.Tasks.RestoreNpmPackagesTaskName)
    ;

Task("002-Build")
<% if (majorVersion != '9.1') { -%>
    .IsDependentOn(Sitecore.Tasks.GenerateCodeTaskName)
<% } -%>    
    .IsDependentOn(Sitecore.Tasks.BuildClientCodeTaskName)
    .IsDependentOn(Sitecore.Tasks.BuildServerCodeTaskName)
    ;

Task("003-Tests")
    .IsDependentOn(Sitecore.Tasks.RunServerUnitTestsTaskName)
    .IsDependentOn(Sitecore.Tasks.RunClientUnitTestsTaskName)
    .IsDependentOn(Sitecore.Tasks.MergeCoverageReportsTaskName)
    ;

Task("004-Packages")
<% if (majorVersion != '9.1') { -%>
    .IsDependentOn(Sitecore.Tasks.CopyShipFilesTaskName)
    .IsDependentOn(Sitecore.Tasks.CopySpeRemotingFilesTaskName)
<% } -%>
    .IsDependentOn(Sitecore.Tasks.RunPackagesInstallationTask)
    ;

Task("005-Publish")
    .IsDependentOn(Sitecore.Tasks.PublishFoundationTaskName)
    .IsDependentOn(Sitecore.Tasks.PublishFeatureTaskName)
    .IsDependentOn(Sitecore.Tasks.PublishProjectTaskName)
    ;

Task("006-Sync-Content")
    .IsDependentOn(Sitecore.Tasks.SyncAllUnicornItems)
    ;

// //////////////////////////////////////////////////
// Targets
// //////////////////////////////////////////////////

Task("Default") // LocalDev
    .IsDependentOn("000-Clean")
    .IsDependentOn("001-Restore")
    .IsDependentOn("002-Build")
    .IsDependentOn("003-Tests")
    //.IsDependentOn("004-Packages")
    .IsDependentOn("005-Publish")
    .IsDependentOn("006-Sync-Content");

Task("Build-and-Publish") // LocalDev
    .IsDependentOn("002-Build")
    .IsDependentOn("005-Publish");
// //////////////////////////////////////////////////
// Execution
// //////////////////////////////////////////////////

RunTarget(Target);