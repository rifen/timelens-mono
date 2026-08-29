-- Lazy.nvim plugin spec for TimeScope
-- Add this to your lazy.nvim config:

return {
  'rifen/timescope.nvim',
  version = '^0.1.0',
  dependencies = {
    'nvim-lua/plenary.nvim' -- optional, for better job control
  },
  opts = {
    format = 'compact',          -- compact, verbose, or both
    default_unit = 'seconds',
    min_value = 1,
    max_value = 31557600000,
    context_clues = true,
    show_breakdown = false,
    show_unit_label = true,
  },
  keys = {
    { '<leader>tl', desc = 'TimeScope: toggle hover' },
  },
  config = function(_, opts)
    require('timescope').setup(opts)
  end,
}
