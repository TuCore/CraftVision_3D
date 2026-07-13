using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.MessageTemplate;

namespace CraftVision.Application.Interfaces;

public interface IMessageTemplateService
{
    Task<IEnumerable<MessageTemplateDto>> GetByCategoryIdAsync(Guid categoryId);
    Task<IEnumerable<MessageTemplateDto>> GetAllAsync();
    Task<MessageTemplateDto> CreateAsync(CreateMessageTemplateDto dto);
    Task<MessageTemplateDto> UpdateAsync(Guid id, CreateMessageTemplateDto dto);
    Task DeleteAsync(Guid id);
}
