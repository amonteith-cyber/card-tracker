FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY ["CardTracker.Api.csproj", "./"]
RUN dotnet restore "./CardTracker.Api.csproj"

COPY . .
RUN dotnet publish "./CardTracker.Api.csproj" \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "dotnet CardTracker.Api.dll --urls http://0.0.0.0:${PORT:-10000}"]