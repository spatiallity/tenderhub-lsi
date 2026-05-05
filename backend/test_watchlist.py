import asyncio
import httpx

async def test():
    async with httpx.AsyncClient() as client:
        # Get current watchlist
        r = await client.get('http://127.0.0.1:8000/api/v1/watchlist')
        data = r.json()
        print("Initial Watchlist:", data)
        
        # Patch a tender (assuming kd_tender 1 exists or use the first one)
        if not data:
            print("Watchlist is empty, creating one...")
            await client.post('http://127.0.0.1:8000/api/v1/watchlist', json={"kd_tender": 99999, "status_internal": "Dipantau"})
            kd_tender = 99999
        else:
            kd_tender = data[0]['kd_tender']
            
        print(f"Patching kd_tender {kd_tender} to 'Menang'...")
        r = await client.patch(f'http://127.0.0.1:8000/api/v1/watchlist/{kd_tender}', json={"status_internal": "Menang"})
        print("Patch Response:", r.json())
        
        # Get again
        r = await client.get('http://127.0.0.1:8000/api/v1/watchlist')
        print("After Patch Watchlist:", r.json())

if __name__ == '__main__':
    asyncio.run(test())
