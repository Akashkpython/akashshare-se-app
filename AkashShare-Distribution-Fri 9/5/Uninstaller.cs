using System;
using System.IO;
using System.Collections.Generic;
using Microsoft.Win32;

namespace AkAsHShareUninstaller
{
    class Program
    {
        static void Main(string[] args)
        {
            // Set console title
            Console.Title = "AkAsH Share Uninstaller";
            
            // Clear the screen
            Console.Clear();
            
            // Display header
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("==================================================");
            Console.WriteLine("           AkAsH Share Uninstaller");
            Console.WriteLine("==================================================");
            Console.ResetColor();
            Console.WriteLine();
            
            // Initialize attempt counter
            int attempts = 0;
            const int maxAttempts = 3;
            
            // Main uninstall loop
            do
            {
                // Check if maximum attempts reached
                if (attempts >= maxAttempts)
                {
                    Console.WriteLine();
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Too many failed attempts. Uninstall cancelled.");
                    Console.ResetColor();
                    Console.WriteLine();
                    Console.WriteLine("Press any key to exit...");
                    Console.ReadKey();
                    return;
                }
                
                // Prompt user for confirmation
                Console.Write("Type 'AkAsH' to uninstall the app: ");
                string userInput = Console.ReadLine();
                
                // Check if input matches required text (case-insensitive)
                if (string.Equals(userInput, "AkAsH", StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine();
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("Uninstalling AkAsH Share...");
                    Console.ResetColor();
                    Console.WriteLine();
                    
                    // Find installation paths
                    List<string> installPaths = GetInstallationPaths();
                    
                    if (installPaths.Count > 0)
                    {
                        Console.WriteLine($"Found {installPaths.Count} installation location(s):");
                        foreach (string path in installPaths)
                        {
                            Console.WriteLine($"  - {path}");
                        }
                        Console.WriteLine();
                        
                        // Remove application files
                        int removedCount = RemoveApplicationFiles(installPaths);
                        
                        if (removedCount > 0)
                        {
                            Console.WriteLine();
                            Console.ForegroundColor = ConsoleColor.Green;
                            Console.WriteLine("Uninstall successful!");
                            Console.WriteLine("All AkAsH Share files have been removed from your system.");
                            Console.ResetColor();
                        }
                        else
                        {
                            Console.WriteLine();
                            Console.ForegroundColor = ConsoleColor.Yellow;
                            Console.WriteLine("Uninstall completed with warnings.");
                            Console.WriteLine("Some files may not have been removed.");
                            Console.ResetColor();
                        }
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine("No AkAsH Share installation found on this system.");
                        Console.ResetColor();
                    }
                    
                    Console.WriteLine();
                    Console.WriteLine("Press any key to exit...");
                    Console.ReadKey();
                    return;
                }
                else
                {
                    // Incorrect input
                    attempts++;
                    int remaining = maxAttempts - attempts;
                    
                    Console.WriteLine();
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Incorrect name. Uninstall cancelled.");
                    Console.WriteLine($"You have {remaining} attempts remaining.");
                    Console.ResetColor();
                    Console.WriteLine();
                }
            } while (attempts < maxAttempts);
        }
        
        static List<string> GetInstallationPaths()
        {
            List<string> paths = new List<string>();
            
            // Check registry for installed locations
            string[] registryPaths = {
                @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
            };
            
            foreach (string registryPath in registryPaths)
            {
                try
                {
                    using (RegistryKey key = Registry.LocalMachine.OpenSubKey(registryPath))
                    {
                        if (key != null)
                        {
                            foreach (string subKeyName in key.GetSubKeyNames())
                            {
                                using (RegistryKey subKey = key.OpenSubKey(subKeyName))
                                {
                                    if (subKey != null)
                                    {
                                        object displayName = subKey.GetValue("DisplayName");
                                        if (displayName != null && 
                                            (displayName.ToString().Contains("AkAsH") || 
                                             displayName.ToString().Contains("Akash")))
                                        {
                                            object installLocation = subKey.GetValue("InstallLocation");
                                            if (installLocation != null && 
                                                Directory.Exists(installLocation.ToString()))
                                            {
                                                string path = installLocation.ToString().TrimEnd('\\');
                                                if (!paths.Contains(path))
                                                {
                                                    paths.Add(path);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                catch
                {
                    // Continue silently if registry access fails
                }
            }
            
            // Add common installation paths as fallback
            string[] commonPaths = {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "AkAsH Share"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "AkAsH Share"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "AkAsH Share"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "AkAsH Share")
            };
            
            foreach (string path in commonPaths)
            {
                if (Directory.Exists(path) && !paths.Contains(path))
                {
                    paths.Add(path);
                }
            }
            
            return paths;
        }
        
        static int RemoveApplicationFiles(List<string> paths)
        {
            int removedCount = 0;
            
            foreach (string path in paths)
            {
                if (Directory.Exists(path))
                {
                    Console.WriteLine($"Removing application files from {path}...");
                    try
                    {
                        Directory.Delete(path, true);
                        if (!Directory.Exists(path))
                        {
                            Console.ForegroundColor = ConsoleColor.Green;
                            Console.WriteLine($"Successfully removed {path}");
                            Console.ResetColor();
                            removedCount++;
                        }
                        else
                        {
                            Console.ForegroundColor = ConsoleColor.Yellow;
                            Console.WriteLine($"Warning: Could not remove all files from {path}");
                            Console.ResetColor();
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine($"Error removing {path}: {ex.Message}");
                        Console.ResetColor();
                    }
                }
            }
            
            // Remove start menu shortcuts
            string[] startMenuDirs = {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
                    @"Microsoft\Windows\Start Menu\Programs\AkAsH Share"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), 
                    @"Microsoft\Windows\Start Menu\Programs\AkAsH Share")
            };
            
            foreach (string dir in startMenuDirs)
            {
                if (Directory.Exists(dir))
                {
                    Console.WriteLine("Removing start menu shortcuts...");
                    try
                    {
                        Directory.Delete(dir, true);
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine("Successfully removed start menu shortcuts");
                        Console.ResetColor();
                    }
                    catch (Exception ex)
                    {
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine($"Warning: Could not remove start menu shortcuts: {ex.Message}");
                        Console.ResetColor();
                    }
                }
            }
            
            // Remove desktop shortcut
            string desktopShortcut = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), 
                "AkAsH Share.lnk");
            if (File.Exists(desktopShortcut))
            {
                Console.WriteLine("Removing desktop shortcut...");
                try
                {
                    File.Delete(desktopShortcut);
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Successfully removed desktop shortcut");
                    Console.ResetColor();
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"Warning: Could not remove desktop shortcut: {ex.Message}");
                    Console.ResetColor();
                }
            }
            
            return removedCount;
        }
    }
}