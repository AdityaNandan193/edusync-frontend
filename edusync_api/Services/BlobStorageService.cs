using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.Extensions.Configuration;

namespace EduSyncAPI.Services
{
    public class BlobStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName;
        private readonly string _accountName;
        private readonly string _accountKey;

        public BlobStorageService(IConfiguration configuration)
        {
            _containerName = configuration.GetSection("AzureBlobStorage:ContainerName").Value;
            _accountName = configuration.GetSection("AzureBlobStorage:AccountName").Value;
            _accountKey = configuration.GetSection("AzureBlobStorage:AccountKey").Value;
            
            // Create the connection string
            var connectionString = $"DefaultEndpointsProtocol=https;AccountName={_accountName};AccountKey={_accountKey};EndpointSuffix=core.windows.net";
            _blobServiceClient = new BlobServiceClient(connectionString);
            
            // Create container on startup
            CreateContainerIfNotExists();
        }

        private void CreateContainerIfNotExists()
        {
            try
            {
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                containerClient.CreateIfNotExists();
            }
            catch (Exception ex)
            {
                // Log the error but don't throw - this allows the application to start
                // even if there's an issue with blob storage
                Console.WriteLine($"Error creating blob container: {ex.Message}");
            }
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
        {
            try
            {
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                await containerClient.CreateIfNotExistsAsync();
                
                var blobClient = containerClient.GetBlobClient(fileName);
                await blobClient.UploadAsync(fileStream, true);

                // Generate SAS token for the blob
                var sasBuilder = new BlobSasBuilder
                {
                    BlobContainerName = _containerName,
                    BlobName = fileName,
                    Resource = "b",
                    StartsOn = DateTimeOffset.UtcNow.AddMinutes(-5),
                    ExpiresOn = DateTimeOffset.UtcNow.AddYears(1)
                };

                sasBuilder.SetPermissions(BlobSasPermissions.Read);

                // Create the storage shared key credential
                var storageSharedKeyCredential = new Azure.Storage.StorageSharedKeyCredential(
                    _accountName,
                    _accountKey
                );

                // Generate the SAS token
                var sasToken = sasBuilder.ToSasQueryParameters(storageSharedKeyCredential).ToString();

                // Return the full URL with SAS token
                return $"{blobClient.Uri}?{sasToken}";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UploadFileAsync: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public async Task DeleteFileAsync(string fileName)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            await blobClient.DeleteIfExistsAsync();
        }
    }
} 