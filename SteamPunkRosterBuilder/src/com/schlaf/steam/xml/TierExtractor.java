/**
 * 
 */
package com.schlaf.steam.xml;

import java.io.IOException;
import java.util.ArrayList;

import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

import android.content.res.Resources;
import android.content.res.XmlResourceParser;
import android.util.Log;

import com.schlaf.steam.R;
import com.schlaf.steam.SteamPunkRosterApplication;
import com.schlaf.steam.data.ArmyElement;
import com.schlaf.steam.data.ArmySingleton;
import com.schlaf.steam.data.Tier;
import com.schlaf.steam.data.TierBenefit;
import com.schlaf.steam.data.TierCostAlteration;
import com.schlaf.steam.data.TierEntry;
import com.schlaf.steam.data.TierEntryGroup;
import com.schlaf.steam.data.TierFAAlteration;
import com.schlaf.steam.data.TierFreeModel;
import com.schlaf.steam.data.TierLevel;

/**
 * @author S0085289
 * 
 */
public class TierExtractor {

	private static final String TIERSLIST_TAG = "tierslist";
	private static final String TIERS_TAG = "tiers";
	private static final String CASTERID_ATTRIBUTE = "casterId";
	private static final String FACTIONID_ATTRIBUTE="faction";
	private static final String LEVEL_TAG = "level";
	private static final String NUMBER_ATTRIBUTE = "number";
	
	private static final String ONLY_TAG = "only";
	private static final String ENTRY_TAG = "entry";
	
	private static final String BENEFITS_TAG = "benefits";
	private static final String LABEL_ATTRIBUTE = "label";
	private static final String INGAMEEFFECT_TAG = "ingameeffect";
	private static final String ALTERFA_TAG = "alterFA";
	private static final String ALTERCOST_TAG = "alterCost";
	private static final String FREEMODEL_TAG = "freeModel";
	private static final String BONUS_ATTRIBUTE = "bonus";
	private static final String ENTRYID_ATTRIBUTE = "entryId";
	
	
	private static final String MUST_HAVE_TAG = "must_have";
	private static final String ENTRYGROUP_TAG = "entrygroup";
	private static final String INBATTLEGROUPONLY_ATTRIBUTE = "inBattlegroupOnly";
	private static final String MINNUMBER_ATTRIBUTE = "minNumber";
//	private static final String LABEL_ATTRIBUTE = "label";
//	private static final String LABEL_ATTRIBUTE = "label";
//	private static final String BENEFITS_TAG = "benefits";
//	private static final String BENEFITS_TAG = "benefits";
//	private static final String BENEFITS_TAG = "benefits";
	
	
	
	private static final String ID_TAG = "id";
	private static final String NAME_TAG = "name";
	
	private boolean D = false;
	

	/** access to local resources */
	Resources res;
	SteamPunkRosterApplication parentApplication;

	public TierExtractor(Resources res,
			SteamPunkRosterApplication parentApplication) {
		// initial treatment?
		this.res = res;
		this.parentApplication = parentApplication;
	}

	public void doExtract() {

		XmlResourceParser xppTiers = res.getXml(R.xml.tiers);
		
		StringBuffer stringBuffer = new StringBuffer();
		try {
			xppTiers.next();
			int eventType = xppTiers.getEventType();
			while (eventType != XmlPullParser.END_DOCUMENT) {
				if (eventType == XmlPullParser.START_DOCUMENT) {
					stringBuffer.append("--- Start XML ---");
				} else if (eventType == XmlPullParser.START_TAG) {
					stringBuffer.append("\nSTART_TAG: " + xppTiers.getName());
					if (TIERSLIST_TAG.equals(xppTiers.getName())) {
						loadTiers(xppTiers);
					}
				} else if (eventType == XmlPullParser.END_TAG) {
					stringBuffer.append("\nEND_TAG: " + xppTiers.getName());
				} else if (eventType == XmlPullParser.TEXT) {
					stringBuffer.append("\nTEXT: " + xppTiers.getText());
				}
				eventType = xppTiers.next();
			}
			
		} catch (XmlPullParserException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		stringBuffer.append("\n--- End XML ---");
		if (D) Log.d("TiersExtractor",stringBuffer.toString());

	}

	/**
	 * charge la partie "armies" du fichier xml à partir du parser positionné
	 * sur le tag de début
	 * 
	 * @param xpp
	 */
	private void loadTiers(XmlResourceParser xpp) {
		if (D) Log.d("TiersExtractor","loadTiers - start");
		try {
			// xpp.next();
			int eventType = xpp.getEventType();
			while (!(eventType == XmlPullParser.END_TAG && TIERSLIST_TAG
					.equals(xpp.getName()))) {
				// until the end of tag factions
				if (eventType == XmlPullParser.START_TAG) {
					if (TIERS_TAG.equals(xpp.getName())) {
						Tier tier = loadTier(xpp);
						ArmySingleton.getInstance().getTiers().add(tier);
						if (D) Log.d("TiersExtractor", tier.toString());
					}
				}
				eventType = xpp.next();
			}
		} catch (XmlPullParserException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if (D) Log.d("TiersExtractor","loadTiers - end");
	}

	
	/**
	 * charge la partie "armies" du fichier xml à partir du parser positionné
	 * sur le tag de début
	 * 
	 * @param xpp
	 */
	private Tier loadTier(XmlResourceParser xpp) {
		if (D) Log.d("TiersExtractor","loadTier - start");
		
		Tier tier = new Tier();
		String tierName = xpp.getAttributeValue(null, NAME_TAG);;
		String caster = xpp.getAttributeValue(null, CASTERID_ATTRIBUTE);
		String factionId = xpp.getAttributeValue(null, FACTIONID_ATTRIBUTE);
		
		tier.setCasterId(caster);
		tier.setTitle(tierName);
		tier.setFactionId(factionId);
		
		try {
			// xpp.next();
			int eventType = xpp.getEventType();
			while (!(eventType == XmlPullParser.END_TAG && TIERS_TAG
					.equals(xpp.getName()))) {
				// until the end of tag factions
				if (eventType == XmlPullParser.START_TAG) {
					if (LEVEL_TAG.equals(xpp.getName())) {
						TierLevel level = loadLevel(xpp);
						tier.getLevels().add(level);
					}
				}
				eventType = xpp.next();
			}
			
			// adjust "only" models to each level from previous level if no specification
			if (! tier.getLevels().isEmpty()) {
				ArrayList<TierEntry> only = tier.getLevels().get(0).getOnlyModels();
				
				for (TierLevel level : tier.getLevels()) {
					if (level.getLevel() > 1) {
						if (level.getOnlyModels().isEmpty()) {
							level.getOnlyModels().addAll(only);	
						} else {
							only = level.getOnlyModels();
						}
					}
				}
			}
			
			
			
		} catch (XmlPullParserException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if (D) Log.d("TiersExtractor","loadTier - end");
		return tier;
	}	
	
	/**
	 * charge la partie "level" du fichier xml à partir du parser positionné sur
	 * le tag de début d'un level
	 * 
	 * @param xpp
	 * @throws IOException
	 * @throws XmlPullParserException
	 */
	private TierLevel loadLevel(XmlResourceParser xpp)
			throws XmlPullParserException, IOException {

		if (D) Log.d("TiersExtractor","loadLevel - start");
		
		TierLevel level = new TierLevel();
		
		String levelNumber = xpp.getAttributeValue(null, NUMBER_ATTRIBUTE);
		
		level.setLevel(Integer.parseInt(levelNumber));
		
		xpp.next();
		int eventType = xpp.getEventType();
		while (eventType == XmlPullParser.START_TAG) {
			if (ONLY_TAG.equals(xpp.getName())) {
				loadOnly(xpp, level);
			} else if (MUST_HAVE_TAG.equals(xpp.getName())) {
				loadMustHave(xpp, level);
			} else if (BENEFITS_TAG.equals(xpp.getName())) {
				loadBenefits(xpp, level);
			}
			eventType = xpp.next();
		}
		if (D) Log.d("TiersExtractor","loadlevel - end");
		return level;
	}	
	
	
	private void loadBenefits(XmlResourceParser xpp, TierLevel level) throws XmlPullParserException, IOException  {
		TierBenefit benefit = new TierBenefit();
		level.setBenefit(benefit);
		int eventType = xpp.getEventType();
		while (!(eventType == XmlPullParser.END_TAG && BENEFITS_TAG.equals(xpp
				.getName()))) {
			if (eventType == XmlPullParser.START_TAG) {
				if (INGAMEEFFECT_TAG.equals(xpp.getName())) {
					String inGameEffect = xpp.nextText(); // xpp.getAttributeValue(null, LABEL_ATTRIBUTE);
					benefit.setInGameEffect(inGameEffect);
					
				} else if (ALTERFA_TAG.equals(xpp.getName())) {
					TierFAAlteration alteration = new TierFAAlteration();
					String bonus = xpp.getAttributeValue(null, BONUS_ATTRIBUTE);
					String entryId = xpp.getAttributeValue(null, ENTRYID_ATTRIBUTE);
					alteration.setEntry(new TierEntry(entryId));
					alteration.setFaAlteration(parseFA(bonus));
					benefit.getAlterations().add(alteration);
				} else if (ALTERCOST_TAG.equals(xpp.getName())) {
					TierCostAlteration alteration = new TierCostAlteration();
					String bonus = xpp.getAttributeValue(null, BONUS_ATTRIBUTE);
					String entryId = xpp.getAttributeValue(null, ENTRYID_ATTRIBUTE);
					alteration.setEntry(new TierEntry(entryId));
					alteration.setCostAlteration(Integer.parseInt(bonus));
					benefit.getAlterations().add(alteration);
				} else if (FREEMODEL_TAG.equals(xpp.getName())) {
					TierFreeModel freeModel = new TierFreeModel();
					loadFreeModels(xpp, freeModel);
					benefit.getFreebies().add(freeModel);
				} 
			}
			eventType = xpp.next();
		}
	}

	private int parseFA(String bonus) {
		if ("U".equals(bonus)) {
			return ArmyElement.MAX_FA;
		}
		return Integer.parseInt(bonus);
	}

	private void loadFreeModels(XmlResourceParser xpp, TierFreeModel freeModel) throws XmlPullParserException, IOException  {
		int eventType = xpp.getEventType();
		while (!(eventType == XmlPullParser.END_TAG && FREEMODEL_TAG.equals(xpp
				.getName()))) {
			// until the end of tag factions
			if (eventType == XmlPullParser.START_TAG) {
				if (ENTRY_TAG.equals(xpp.getName())) {
					TierEntry entry = loadEntry(xpp);
					freeModel.getFreeModels().add(entry);
				}
			}
			eventType = xpp.next();
		}
	}
	
	private void loadMustHave(XmlResourceParser xpp, TierLevel level) throws XmlPullParserException, IOException  {
		if (D) Log.d("TiersExtractor","loadMustHave - start");
		int eventType = xpp.getEventType();
		while (!(eventType == XmlPullParser.END_TAG && MUST_HAVE_TAG.equals(xpp
				.getName()))) {
			if (eventType == XmlPullParser.START_TAG) {
				if (ENTRYGROUP_TAG.equals(xpp.getName())) {
					TierEntryGroup group = new TierEntryGroup();
					loadEntryGroup(xpp, group);
					
					if (group.isInBattlegroup()) {
						level.getMustHaveModelsInBG().add(group);
					} else if (group.isInJackMarshal()) {
						level.getMustHaveModelsInMarshal().add(group);
					} else {
						level.getMustHaveModels().add(group);	
					}
					
					
				}
			}
			eventType = xpp.next();
		}
	}

	private void loadOnly(XmlResourceParser xpp, TierLevel level) throws XmlPullParserException, IOException  {
		int eventType = xpp.getEventType();
		while (!(eventType == XmlPullParser.END_TAG && ONLY_TAG.equals(xpp
				.getName()))) {
			// until the end of tag factions
			if (eventType == XmlPullParser.START_TAG) {
				if (ENTRY_TAG.equals(xpp.getName())) {
					TierEntry entry = loadEntry(xpp);
					level.getOnlyModels().add(entry);
				}
			}
			eventType = xpp.next();
		}
	}

	private void loadEntryGroup(XmlResourceParser xpp, TierEntryGroup group) throws XmlPullParserException, IOException  {

		String groupMin = xpp.getAttributeValue(null, MINNUMBER_ATTRIBUTE);
		String inBG = xpp.getAttributeValue(null, INBATTLEGROUPONLY_ATTRIBUTE);
		group.setMinCount(Integer.parseInt(groupMin));
		group.setInBattlegroup(Boolean.getBoolean(inBG));
		
		int eventType = xpp.getEventType();
		while (!(eventType == XmlPullParser.END_TAG && ENTRYGROUP_TAG.equals(xpp
				.getName()))) {
			// until the end of tag factions
			if (eventType == XmlPullParser.START_TAG) {
				if (ENTRY_TAG.equals(xpp.getName())) {
					TierEntry entry = loadEntry(xpp);
					group.getEntries().add(entry);
				}
			}
			eventType = xpp.next();
		}
	}	
	
	private TierEntry loadEntry(XmlResourceParser xpp) {
		String id = xpp.getAttributeValue(null, ID_TAG);;
		TierEntry entry = new TierEntry(id);
		return entry;
	}

	private int extractFromString(String s) {
		if (s == null || s.length() == 0 || s.trim().length() == 0) {
			return 0;
		} else {
			try {
				return Integer.valueOf(s);
			} catch (Exception e) {
				return 0;
			}
		}
	}

}
