import sys, json, urllib.request
sys.path.insert(0, r'C:/Users/user/.claude/harness')
import anthropic_capped as A
def ask(model, content, max_tokens=800, who='?', extra=None):
    pi, po = A._price(model)
    worst = (len(json.dumps(content)) / 3 * pi + max_tokens * po) / 1e6
    def check(d):
        if d['key2_spent_usd'] + worst > d['key2_cap_usd']: raise RuntimeError('cap reached')
    A._locked(check)
    k = open(A.KEY).read().strip().lstrip('\ufeff')
    b = {'model': model, 'max_tokens': max_tokens, 'messages': [{'role': 'user', 'content': content}]}
    b.update(extra or {})
    q = urllib.request.Request('https://api.anthropic.com/v1/messages', json.dumps(b).encode(), {'x-api-key': k, 'anthropic-version': '2023-06-01', 'content-type': 'application/json'})
    try: j = json.load(urllib.request.urlopen(q, timeout=600))
    except urllib.error.HTTPError as e: raise RuntimeError(e.read().decode()[:500])
    u = j['usage']; usd = ((u['input_tokens'] + u.get('cache_creation_input_tokens', 0)) * pi + u['output_tokens'] * po) / 1e6
    def add(d):
        d['key2_spent_usd'] = round(d['key2_spent_usd'] + usd, 6)
        d['log'] = (d.get('log') or [])[-500:] + [[__import__('time').strftime('%m-%d %H:%M'), who, model, round(usd, 6)]]
    A._locked(add)
    return ''.join(x.get('text', '') for x in j['content']), usd, [x['type'] for x in j['content']], u
