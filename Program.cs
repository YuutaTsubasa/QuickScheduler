return await Bootstrapper
  .Factory
  .CreateWeb(args)
  .DeployToGitHubPages(
        "YuutaTsubasa",
        "QuickSceduler",
        Config.FromSetting<string>("GITHUB_TOKEN")
    )
  .RunAsync();