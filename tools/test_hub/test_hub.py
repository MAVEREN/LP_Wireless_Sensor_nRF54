#!/usr/bin/env python3
"""
Software Test Hub - BLE Central for testing sensor nodes
"""

import asyncio
import argparse
from rich.console import Console
from rich.table import Table
from rich import print as rprint

console = Console()

class TestHub:
    def __init__(self, config=None):
        self.nodes = {}
        self.connections = {}
        self.running = False
        
    async def scan(self):
        """Scan for BLE devices"""
        console.print("[INFO] Scanning for nodes...", style="blue")
        # Simulated scan results
        self.nodes = {
            "DC:A6:32:A3:F2:15": {"name": "Sensor-A3F2", "rssi": -45, "battery": 95},
            "E1:B4:27:C5:D8:91": {"name": "Sensor-D891", "rssi": -52, "battery": 87}
        }
        for addr, info in self.nodes.items():
            console.print(f"[FOUND] Node: {info['name']} (RSSI: {info['rssi']} dBm, Battery: {info['battery']}%)", style="green")
    
    async def connect(self, address):
        """Connect to a node"""
        if address in self.nodes:
            console.print(f"[INFO] Connecting to {address}...", style="blue")
            self.connections[address] = True
            console.print(f"[SUCCESS] Connected to {self.nodes[address]['name']}", style="green")
        else:
            console.print(f"[ERROR] Node {address} not found", style="red")
    
    def show_nodes(self):
        """Display nodes table"""
        table = Table(title="Discovered Nodes")
        table.add_column("Address", style="cyan")
        table.add_column("Name", style="magenta")
        table.add_column("Battery", style="green")
        table.add_column("RSSI", style="yellow")
        table.add_column("State", style="blue")
        
        for addr, info in self.nodes.items():
            state = "CONN" if addr in self.connections else "DISC"
            table.add_row(addr, info['name'], f"{info['battery']}%", f"{info['rssi']} dBm", state)
        
        console.print(table)
    
    async def run_interactive(self):
        """Run interactive CLI"""
        self.running = True
        console.print("[bold green]Test Hub Started[/bold green]")
        console.print("Type 'help' for available commands\n")
        
        while self.running:
            try:
                cmd = await asyncio.get_event_loop().run_in_executor(None, input, "Test Hub> ")
                cmd = cmd.strip()
                
                if cmd == "scan":
                    await self.scan()
                elif cmd.startswith("connect "):
                    addr = cmd.split()[1]
                    await self.connect(addr)
                elif cmd == "nodes":
                    self.show_nodes()
                elif cmd == "help":
                    console.print("\nAvailable commands:", style="bold")
                    console.print("  scan - Scan for nodes")
                    console.print("  connect <address> - Connect to node")
                    console.print("  nodes - Show nodes table")
                    console.print("  help - Show this help")
                    console.print("  quit - Exit\n")
                elif cmd == "quit":
                    self.running = False
                elif cmd:
                    console.print(f"[ERROR] Unknown command: {cmd}", style="red")
                    
            except (KeyboardInterrupt, EOFError):
                self.running = False
        
        console.print("\n[bold yellow]Test Hub Stopped[/bold yellow]")

async def main():
    parser = argparse.ArgumentParser(description="Software Test Hub for Sensor Nodes")
    parser.add_argument("--config", help="Config file path", default="config.yaml")
    parser.add_argument("--auto-connect", action="store_true", help="Auto-connect to all nodes")
    parser.add_argument("--mock-cloud", action="store_true", help="Enable mock cloud server")
    parser.add_argument("--verbose", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    hub = TestHub(config=args.config)
    await hub.run_interactive()

if __name__ == "__main__":
    asyncio.run(main())
