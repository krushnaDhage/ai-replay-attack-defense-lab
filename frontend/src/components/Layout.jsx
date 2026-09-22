import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  AppBar, Toolbar, Typography, IconButton, Divider, Chip, Tooltip
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import BugReportIcon from '@mui/icons-material/BugReport'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import PsychologyIcon from '@mui/icons-material/Psychology'
import ReportIcon from '@mui/icons-material/Report'
import TimelineIcon from '@mui/icons-material/Timeline'
import CompareIcon from '@mui/icons-material/Compare'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import InfoIcon from '@mui/icons-material/Info'
import LogoutIcon from '@mui/icons-material/Logout'
import ShieldIcon from '@mui/icons-material/Shield'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuth } from '../context/AuthContext'

const DRAWER_WIDTH = 240

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Transactions', icon: <SwapHorizIcon />, path: '/transactions' },
  { divider: true, label: 'Attack Lab' },
  { label: 'Attack Simulator', icon: <BugReportIcon />, path: '/attack-simulator', highlight: true },
  { label: 'Attack Visualization', icon: <PlayCircleIcon />, path: '/attack-visualization' },
  { label: 'Before vs After', icon: <CompareIcon />, path: '/before-after' },
  { divider: true, label: 'Analysis' },
  { label: 'AI Analysis', icon: <PsychologyIcon />, path: '/ai-analysis' },
  { label: 'Incidents', icon: <ReportIcon />, path: '/incidents' },
  { label: 'Security Events', icon: <TimelineIcon />, path: '/events' },
  { divider: true, label: 'Info' },
  { label: 'Architecture', icon: <AccountTreeIcon />, path: '/architecture' },
  { label: 'About Project', icon: <InfoIcon />, path: '/about' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(0,212,255,0.15)' }}>
        <ShieldIcon sx={{ color: '#00d4ff', fontSize: 32 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#00d4ff', fontWeight: 700, lineHeight: 1.2 }}>
            AI Defense Lab
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '10px' }}>
            Replay Attack Detection
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, pt: 1, px: 1 }}>
        {navItems.map((item, idx) => {
          if (item.divider) return (
            <Box key={idx} sx={{ pt: 1, pb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#475569', px: 1.5, fontSize: '10px', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                {item.label}
              </Typography>
            </Box>
          )
          const active = location.pathname === item.path
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 0.9,
                  bgcolor: active ? 'rgba(0,212,255,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
                  '&:hover': { bgcolor: 'rgba(0,212,255,0.08)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? '#00d4ff' : '#64748b' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    color: active ? '#00d4ff' : '#94a3b8'
                  }}
                />
                {item.highlight && (
                  <Chip label="LAB" size="small" sx={{ height: 18, fontSize: 9, bgcolor: 'rgba(255,51,102,0.2)', color: '#ff3366', border: '1px solid rgba(255,51,102,0.4)' }} />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* User info */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: '#00d4ff', fontWeight: 600, fontSize: 12 }}>
            {user?.username}
          </Typography>
          <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={handleLogout} sx={{ color: '#64748b', '&:hover': { color: '#ff3366' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#050b14' }}>
      {/* Sidebar */}
      <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: '#080f1e', border: 'none', borderRight: '1px solid rgba(0,212,255,0.1)' } }}>
        {drawer}
      </Drawer>

      {/* Mobile AppBar */}
      <AppBar position="fixed" sx={{ display: { sm: 'none' }, bgcolor: '#080f1e', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
        <Toolbar>
          <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ color: '#00d4ff' }}>
            <MenuIcon />
          </IconButton>
          <ShieldIcon sx={{ color: '#00d4ff', ml: 1, mr: 1 }} />
          <Typography variant="subtitle1" sx={{ color: '#00d4ff', fontWeight: 700 }}>AI Defense Lab</Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { sm: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: '#080f1e' } }}>
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 1, sm: 3 }, mt: { xs: 8, sm: 0 } }}>
        <Outlet />
      </Box>
    </Box>
  )
}
