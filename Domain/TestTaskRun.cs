namespace str_test_demo_blazor.Domain;

public enum TestTaskResult
{
    Pass,
    Fail,
    NA,
    NotRun
}

public class TestTaskRun
{
    public Guid Id { get; init; }
    public Guid TaskTemplateId { get; init; }
    public string Title { get; init; } = string.Empty;
    public TestTaskResult Result { get; set; } = TestTaskResult.NotRun;
    public string? Comment { get; set; }
    public List<string> PhotoSvgPaths { get; init; } = [];
    public int MinutesSpent { get; set; }
}
