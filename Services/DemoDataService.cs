using str_test_demo_blazor.Domain;

namespace str_test_demo_blazor.Services;

public class DemoDataService
{
    private readonly List<Asset> _assets;
    private readonly List<TestTemplate> _templates;
    private readonly List<TestRun> _testRuns = [];

    public DemoDataService()
    {
        _assets = SeedAssets();
        _templates = SeedTemplates();
        SeedRecentRuns();
    }

    public IReadOnlyList<Asset> Assets => _assets;
    public IReadOnlyList<TestTemplate> Templates => _templates;
    public IReadOnlyList<TestRun> TestRuns => _testRuns;

    public TestRun CreateTestRun(Guid assetId, Guid templateId, string technicianName = "Demo Tech")
    {
        var template = _templates.First(template => template.Id == templateId);

        var run = new TestRun
        {
            Id = Guid.NewGuid(),
            AssetId = assetId,
            TemplateId = templateId,
            StartedAt = DateTime.Now,
            Status = TestRunStatus.InProgress,
            TechnicianName = technicianName,
            TestTaskRuns = template.TestTasks.Select(task => new TestTaskRun
            {
                Id = Guid.NewGuid(),
                TaskTemplateId = task.Id,
                Title = task.Title,
                Result = TestTaskResult.NotRun,
                MinutesSpent = 0
            }).ToList()
        };

        _testRuns.Insert(0, run);
        return run;
    }

    public Asset? FindAsset(Guid id) => _assets.FirstOrDefault(asset => asset.Id == id);
    public TestTemplate? FindTemplate(Guid id) => _templates.FirstOrDefault(template => template.Id == id);
    public TestRun? FindTestRun(Guid id) => _testRuns.FirstOrDefault(run => run.Id == id);

    private static List<Asset> SeedAssets() =>
    [
        NewAsset("AST-1001", "SN-39210", "Pressure Gauge", "Plant 1", "Active"),
        NewAsset("AST-1002", "SN-17421", "Flow Meter", "Plant 2", "Maintenance"),
        NewAsset("AST-1003", "SN-77152", "Compressor", "Warehouse", "Active"),
        NewAsset("AST-1004", "SN-68290", "Valve", "Plant 1", "Inactive"),
        NewAsset("AST-1005", "SN-42930", "Generator", "Plant 3", "Active"),
        NewAsset("AST-1006", "SN-88412", "Pump", "Plant 2", "Active"),
        NewAsset("AST-1007", "SN-55219", "Thermal Camera", "Lab", "Calibration Due"),
        NewAsset("AST-1008", "SN-10042", "Relief Valve", "Plant 1", "Active"),
        NewAsset("AST-1009", "SN-81230", "Control Panel", "Plant 3", "Maintenance"),
        NewAsset("AST-1010", "SN-66011", "Boiler", "Plant 4", "Active")
    ];

    private static Asset NewAsset(string tag, string serial, string type, string location, string status) =>
        new()
        {
            Id = Guid.NewGuid(),
            AssetTag = tag,
            Serial = serial,
            Type = type,
            Location = location,
            Status = status
        };

    private static List<TestTemplate> SeedTemplates() =>
    [
        BuildTemplate("Daily Safety Walkdown", 1, "Checklist"),
        BuildTemplate("Weekly Performance Check", 7, "Performance"),
        BuildTemplate("Monthly Calibration", 30, "Calibration")
    ];

    private static TestTemplate BuildTemplate(string name, int frequencyDays, string prefix)
    {
        var tasks = Enumerable.Range(1, 8).Select(index => new TestTaskTemplate
        {
            Id = Guid.NewGuid(),
            Title = $"{prefix} Task {index}",
            RequiresPhoto = index is 2 or 5 or 8,
            DefaultExpectedMinutes = 5 + index
        }).ToList();

        return new TestTemplate
        {
            Id = Guid.NewGuid(),
            Name = name,
            FrequencyDays = frequencyDays,
            TestTasks = tasks
        };
    }

    private void SeedRecentRuns()
    {
        AddCompletedRun(_assets[9].Id, _templates[0].Id, "A. Ruiz", 1);
        AddCompletedRun(_assets[5].Id, _templates[1].Id, "M. Patel", 3);
        AddCompletedRun(_assets[4].Id, _templates[2].Id, "L. Chen", 6);

        var openRun = CreateTestRun(_assets[2].Id, _templates[0].Id, "S. Kim");
        openRun.StartedAt = DateTime.Now.AddHours(-2);
    }

    private void AddCompletedRun(Guid assetId, Guid templateId, string tech, int hoursAgo)
    {
        var run = CreateTestRun(assetId, templateId, tech);
        run.Status = TestRunStatus.Completed;
        run.CompletedAt = DateTime.Now.AddHours(-hoursAgo);

        for (var index = 0; index < run.TestTaskRuns.Count; index++)
        {
            var task = run.TestTaskRuns[index];
            task.Result = index % 6 == 0
                ? TestTaskResult.Fail
                : index % 4 == 0
                    ? TestTaskResult.NA
                    : TestTaskResult.Pass;
            task.MinutesSpent = 4 + index;

            if (task.Result != TestTaskResult.Pass)
            {
                task.Comment = task.Result == TestTaskResult.Fail
                    ? "Follow-up maintenance required."
                    : "Not applicable for this asset configuration.";
            }

            if (index % 3 == 1)
            {
                task.PhotoSvgPaths.Add("demo-images/photo-placeholder-1.svg");
                task.PhotoSvgPaths.Add("demo-images/photo-placeholder-2.svg");
            }
            else if (index % 3 == 2)
            {
                task.PhotoSvgPaths.Add("demo-images/camera-icon-placeholder.svg");
            }
        }
    }
}
