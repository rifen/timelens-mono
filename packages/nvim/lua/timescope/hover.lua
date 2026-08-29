local M = {}

-- Compute the bridge path relative to this file
local plugin_root = debug.getinfo(1, 'S').source:match('@?(.*/)')
local bridge_path = plugin_root .. '../bin/timescope-bridge.js'

function M.setup()
  local group = vim.api.nvim_create_augroup('TimeScope', { clear = true })
  vim.api.nvim_create_autocmd({ 'CursorMoved', 'CursorMovedI' }, {
    group = group,
    callback = function()
      M.show_duration()
    end
  })
end

function M.show_duration()
  -- Clear previous virtual text
  vim.api.nvim_buf_clear_namespace(0, M.namespace, 0, -1)

  -- Get current line and cursor position
  local cursor = vim.api.nvim_win_get_cursor(0)
  local row = cursor[1] - 1
  local col = cursor[2]
  local line = vim.api.nvim_buf_get_lines(0, row, row + 1, false)[1] or ''

  -- Extract token under cursor
  local token = M.get_token_at_cursor(line, col)
  if not token then return end

  -- Call Node.js bridge
  local input = vim.fn.json_encode({ token = token, line = line })

  vim.fn.jobstart({ 'node', bridge_path }, {
    stdin = 'pipe',
    stdout = 'pipe',
    on_stdout = function(_, data)
      if not data or #data == 0 then return end

      local response = vim.fn.json_decode(table.concat(data))
      if response and response.text then
        local virt_text = { { response.text, 'Comment' } }

        if response.hint then
          table.insert(virt_text, { ' (' .. response.hint .. ')', 'DiagnosticHint' })
        end

        vim.api.nvim_buf_set_extmark(0, M.namespace, row, -1, {
          virt_text = virt_text,
          virt_text_pos = 'eol',
          hl_mode = 'combine'
        })
      end
    end
  }):write(input)
end

function M.get_token_at_cursor(line, col)
  -- Find the number at or before cursor position
  local before = line:sub(1, col + 1)
  local after = line:sub(col + 1)

  -- Look for number boundaries
  local num_start = before:match('.*()%d')
  local num_end = after:match('%d+()')

  if not num_start or not num_end then
    return nil
  end

  return line:sub(num_start, col + num_end - 1)
end

M.namespace = vim.api.nvim_create_namespace('timescope')
M.bridge_path = bridge_path

return M
