return await Bootstrapper
  .Factory
  .CreateWeb(args)
  .DeployToGitHubPages(
        "YuutaTsubasa",
        "QuickScheduler",
        Config.FromSetting<string>("GITHUB_TOKEN")
    )
  .RunAsync();