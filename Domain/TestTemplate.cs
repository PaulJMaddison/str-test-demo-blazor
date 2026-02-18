namespace str_test_demo_blazor.Domain;

public class TestTemplate
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public int FrequencyDays { get; init; }
    public List<TestTaskTemplate> TestTasks { get; init; } = [];
}
