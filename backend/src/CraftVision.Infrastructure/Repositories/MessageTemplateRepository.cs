using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class MessageTemplateRepository : IMessageTemplateRepository
{
    private readonly ApplicationDbContext _context;

    public MessageTemplateRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MessageTemplate>> GetByCategoryIdAsync(Guid categoryId)
    {
        return await _context.Set<MessageTemplate>().Where(x => x.GiftCategoryId == categoryId).ToListAsync();
    }

    public async Task<IEnumerable<MessageTemplate>> GetAllAsync()
    {
        return await _context.Set<MessageTemplate>().ToListAsync();
    }

    public void Add(MessageTemplate template)
    {
        _context.Set<MessageTemplate>().Add(template);
    }

    public void Update(MessageTemplate template)
    {
        _context.Set<MessageTemplate>().Update(template);
    }

    public void Delete(MessageTemplate template)
    {
        _context.Set<MessageTemplate>().Remove(template);
    }
}
