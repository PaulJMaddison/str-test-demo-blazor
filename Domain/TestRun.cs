namespace str_test_demo_blazor.Domain;

public enum TestRunStatus
{
    NotStarted,
    InProgress,
    Completed
}

public class TestRun
{
    public Guid Id { get; init; }
    public Guid AssetId { get; init; }
    public Guid TemplateId { get; init; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public TestRunStatus Status { get; set; } = TestRunStatus.NotStarted;
    public string TechnicianName { get; set; } = string.Empty;
    public List<TestTaskRun> TestTaskRuns { get; init; } = [];
    public int TotalMinutes => TestTaskRuns.Sum(task => task.MinutesSpent);
}
