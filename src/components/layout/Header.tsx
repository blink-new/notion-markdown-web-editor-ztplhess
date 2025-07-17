import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { 
  FileText, 
  Globe, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  Share,
  User
} from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onPublish: () => void
  currentDocument?: { 
    title: string
    is_published?: boolean
    published_url?: string
  }
  user?: any
  onSignOut?: () => void
}

export function Header({ onPublish, currentDocument, user, onSignOut }: HeaderProps) {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="border-b bg-white dark:bg-gray-900 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="font-semibold text-lg">NotionMD</span>
        </div>
        {currentDocument && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 dark:text-gray-300">
              {currentDocument.title}
            </span>
            {currentDocument.is_published && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Globe className="h-3 w-3 mr-1" />
                Published
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {currentDocument?.is_published && currentDocument.published_url && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(currentDocument.published_url, '_blank')}
          >
            <Share className="h-4 w-4 mr-2" />
            View Live
          </Button>
        )}

        <Button onClick={onPublish} size="sm" disabled={!currentDocument}>
          <Globe className="h-4 w-4 mr-2" />
          {currentDocument?.is_published ? 'Update' : 'Publish'}
        </Button>

        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <User className="h-4 w-4 mr-2" />
              {user?.email || 'User'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}