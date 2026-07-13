using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.MessageTemplate;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Services;

public class MessageTemplateService : IMessageTemplateService
{
    private readonly IUnitOfWork _unitOfWork;

    public MessageTemplateService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<MessageTemplateDto>> GetByCategoryIdAsync(Guid categoryId)
    {
        var items = await _unitOfWork.MessageTemplates.GetByCategoryIdAsync(categoryId);
        return items.Select(x => new MessageTemplateDto { Id = x.Id, GiftCategoryId = x.GiftCategoryId, Title = x.Title, Content = x.Content, IsPremium = x.IsPremium });
    }

    public async Task<IEnumerable<MessageTemplateDto>> GetAllAsync()
    {
        var items = await _unitOfWork.MessageTemplates.GetAllAsync();
        return items.Select(x => new MessageTemplateDto { Id = x.Id, GiftCategoryId = x.GiftCategoryId, Title = x.Title, Content = x.Content, IsPremium = x.IsPremium });
    }

    public async Task<MessageTemplateDto> CreateAsync(CreateMessageTemplateDto dto)
    {
        var entity = new MessageTemplate { GiftCategoryId = dto.GiftCategoryId, Title = dto.Title, Content = dto.Content, IsPremium = dto.IsPremium, CreatedAt = DateTime.UtcNow };
        _unitOfWork.MessageTemplates.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return new MessageTemplateDto { Id = entity.Id, GiftCategoryId = entity.GiftCategoryId, Title = entity.Title, Content = entity.Content, IsPremium = entity.IsPremium };
    }

    public async Task<MessageTemplateDto> UpdateAsync(Guid id, CreateMessageTemplateDto dto)
    {
        var entity = await _unitOfWork.MessageTemplates.GetAllAsync(); // Mocking GetById
        var target = entity.FirstOrDefault(x => x.Id == id);
        if (target == null) throw new Exception("Message template not found");
        
        target.GiftCategoryId = dto.GiftCategoryId;
        target.Title = dto.Title;
        target.Content = dto.Content;
        target.IsPremium = dto.IsPremium;
        
        _unitOfWork.MessageTemplates.Update(target);
        await _unitOfWork.SaveChangesAsync();
        
        return new MessageTemplateDto { Id = target.Id, GiftCategoryId = target.GiftCategoryId, Title = target.Title, Content = target.Content, IsPremium = target.IsPremium };
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await _unitOfWork.MessageTemplates.GetAllAsync(); // Mocking GetById
        var target = entity.FirstOrDefault(x => x.Id == id);
        if (target == null) throw new Exception("Message template not found");
        
        _unitOfWork.MessageTemplates.Delete(target);
        await _unitOfWork.SaveChangesAsync();
    }
}
