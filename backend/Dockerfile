# Sử dụng image ASP.NET Core Runtime 10.0 làm môi trường chạy (Tối ưu dung lượng)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Sử dụng image .NET SDK 10.0 để build code
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy toàn bộ thư mục src vào container
COPY ["src/", "src/"]

# Phục hồi các gói phụ thuộc (NuGet packages)
RUN dotnet restore "src/CraftVision.Presentation/CraftVision.Presentation.csproj"

# Di chuyển vào thư mục Presentation để Build
WORKDIR "/src/src/CraftVision.Presentation"
RUN dotnet build "CraftVision.Presentation.csproj" -c Release -o /app/build

# Publish code thành các file chạy độc lập
FROM build AS publish
RUN dotnet publish "CraftVision.Presentation.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Giai đoạn cuối: Copy các file đã publish sang môi trường chạy
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Tắt GC Server (dành cho gói Free RAM thấp) và tắt Diagnostics (giúp tránh lỗi 139 trên Render)
ENV DOTNET_SYSTEM_GC_SERVER=false
ENV DOTNET_EnableDiagnostics=0

# Định nghĩa lệnh khởi chạy khi Container chạy
ENTRYPOINT ["dotnet", "CraftVision.Presentation.dll"]
