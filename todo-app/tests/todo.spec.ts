import { test, expect } from '@playwright/test'

test.describe('Todo List Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display empty state when no todos exist', async ({ page }) => {
    await expect(page.getByText('Nenhuma tarefa ainda')).toBeVisible()
  })

  test('should add a new todo', async ({ page }) => {
    const input = page.locator('input[placeholder="Nova tarefa..."]')
    await input.fill('Buy groceries')
    await input.press('Enter')
    
    await expect(page.getByText('Buy groceries')).toBeVisible()
    await expect(input).toHaveValue('')
  })

  test('should mark todo as done', async ({ page }) => {
    const input = page.locator('input[placeholder="Nova tarefa..."]')
    await input.fill('Task to complete')
    await input.press('Enter')
    
    const todoItem = page.locator('div.group').filter({ hasText: 'Task to complete' })
    const checkbox = todoItem.locator('button[aria-label*="Marcar"]')
    await checkbox.click()
    
    const todoText = todoItem.getByText('Task to complete')
    await expect(todoText).toHaveCSS('text-decoration', /line-through/)
  })

  test('should edit a todo', async ({ page }) => {
    const input = page.locator('input[placeholder="Nova tarefa..."]')
    await input.fill('Original task')
    await input.press('Enter')
    
    await page.locator('span').filter({ hasText: 'Original task' }).click()
    
    const editInput = page.locator('input[type="text"]').nth(1)
    await editInput.fill('Updated task')
    await editInput.press('Enter')
    
    await expect(page.getByText('Updated task')).toBeVisible()
    await expect(page.getByText('Original task')).not.toBeVisible()
  })

  test('should delete a todo', async ({ page }) => {
    const input = page.locator('input[placeholder="Nova tarefa..."]')
    await input.fill('Task to delete')
    await input.press('Enter')
    
    await expect(page.getByText('Task to delete')).toBeVisible()
    
    const todoItem = page.locator('div.group').filter({ hasText: 'Task to delete' })
    const deleteButton = todoItem.locator('button[aria-label="Excluir tarefa"]')
    await deleteButton.click()
    
    await expect(page.getByText('Task to delete')).not.toBeVisible()
    await expect(page.getByText('Nenhuma tarefa ainda')).toBeVisible()
  })

  test('should add multiple todos', async ({ page }) => {
    const input = page.locator('input[placeholder="Nova tarefa..."]')
    
    await input.fill('First task')
    await input.press('Enter')
    await input.fill('Second task')
    await input.press('Enter')
    await input.fill('Third task')
    await input.press('Enter')
    
    await expect(page.getByText('First task')).toBeVisible()
    await expect(page.getByText('Second task')).toBeVisible()
    await expect(page.getByText('Third task')).toBeVisible()
  })

  test('should toggle todo completion state', async ({ page }) => {
    const input = page.locator('input[placeholder="Nova tarefa..."]')
    await input.fill('Toggle task')
    await input.press('Enter')
    
    const todoItem = page.locator('div.group').filter({ hasText: 'Toggle task' })
    const checkbox = todoItem.locator('button[aria-label*="Marcar"]')
    const todoText = todoItem.getByText('Toggle task')
    
    await checkbox.click()
    await expect(todoText).toHaveCSS('text-decoration', /line-through/)
    
    await checkbox.click()
    await expect(todoText).not.toHaveCSS('text-decoration', /line-through/)
  })
})
