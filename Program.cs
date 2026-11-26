
using Microsoft.AspNetCore.HttpOverrides;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSvelte", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .Build();

WebApplication app = builder.Build();

app.UseForwardedHeaders();

app.UseCors("AllowSvelte");

await app.BootUmbracoAsync();

//app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    var path = context.Request.Path;
    if (path.StartsWithSegments("/media") && path.Value!.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase))
        context.Response.OnStarting(() => { context.Response.Headers.CacheControl = "public, max-age=2592000"; return Task.CompletedTask; });
    await next();
});

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
