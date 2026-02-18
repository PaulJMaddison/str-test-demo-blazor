namespace str_test_demo_blazor.Domain;

public class TestTaskTemplate
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public bool RequiresPhoto { get; init; }
    public int DefaultExpectedMinutes { get; init; }
}
