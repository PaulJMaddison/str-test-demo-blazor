namespace str_test_demo_blazor.Domain;

public class Asset
{
    public Guid Id { get; init; }
    public string AssetTag { get; init; } = string.Empty;
    public string Serial { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
}
