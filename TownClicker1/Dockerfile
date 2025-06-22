FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["TownClicker/TownClicker.csproj", "TownClicker/"]
RUN dotnet restore "TownClicker/TownClicker.csproj"
COPY . .
WORKDIR "/src/TownClicker"
RUN dotnet build "TownClicker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TownClicker.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TownClicker.dll"]
