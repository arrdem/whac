package com.schlaf.steam.storage;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.PrintStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Environment;
import android.os.SystemClock;
import android.preference.PreferenceManager;
import android.util.Log;

import com.schlaf.steam.R;
import com.schlaf.steam.activities.PreferenceConstants;
import com.schlaf.steam.activities.battle.BattleEntry;
import com.schlaf.steam.activities.battle.BattleResult;
import com.schlaf.steam.activities.battle.BattleSingleton;
import com.schlaf.steam.activities.battle.BeastEntry;
import com.schlaf.steam.activities.battle.JackEntry;
import com.schlaf.steam.activities.battle.KarchevEntry;
import com.schlaf.steam.activities.battle.MultiPVUnit;
import com.schlaf.steam.activities.battle.SingleDamageLineEntry;
import com.schlaf.steam.activities.selectlist.SelectionModelSingleton;
import com.schlaf.steam.activities.selectlist.selected.BeastCommander;
import com.schlaf.steam.activities.selectlist.selected.JackCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedArmyCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedEntry;
import com.schlaf.steam.activities.selectlist.selected.SelectedRankingOfficer;
import com.schlaf.steam.activities.selectlist.selected.SelectedUA;
import com.schlaf.steam.activities.selectlist.selected.SelectedUnit;
import com.schlaf.steam.activities.selectlist.selected.SelectedWA;
import com.schlaf.steam.activities.selectlist.selected.SelectedWarbeast;
import com.schlaf.steam.activities.selectlist.selected.SelectedWarjack;
import com.schlaf.steam.data.ArmyCommander;
import com.schlaf.steam.data.ArmyElement;
import com.schlaf.steam.data.ArmySingleton;
import com.schlaf.steam.data.BattleEngine;
import com.schlaf.steam.data.FactionNamesEnum;
import com.schlaf.steam.data.Solo;
import com.schlaf.steam.data.Unit;
import com.schlaf.steam.data.Warbeast;
import com.schlaf.steam.data.Warjack;
import com.schlaf.steam.data.WarjackDamageGrid;
import com.schlaf.steam.data.WeaponAttachment;

public class StorageManager {
	
	public static final String WHAC_SUBDIR = "/Whac";
	public static final String DOWNLOAD_SUBDIR = "/download";

	private static final String TAG = "StorageManager";

	/**
	 * directory for imported data files
	 */
	public static final String IMPORT_FILES_DIR = "import";
	/** directory for army lists */
	public static final String ARMY_LISTS_DIR = "armylists";
	/** directory for battles */
	public static final String BATTLE_LISTS_DIR = "battlelists";
	/** directory for battle results */
	public static final String BATTLE_RESULTS_DIR = "battleresults";
	/** file that contains the last army viewed */
	public static final String ARMY_LIST_LAST_FILE = "armyLastFile";
	/** file that contains the last battle viewed */
	public static final String BATTLE_LAST_FILE = "battleLastFile";
	/** directory for "last files" */
	public static final String LAST_FILES = "lastFiles";
	
	
	private static final char[] ILLEGAL_CHARACTERS = { '/', '\n', '\r', '\t',
		'\0', '\f', '`', '?', '*', '\\', '<', '>', '|', '\"', ':', '.' };

	public static List<ArmyListDescriptor> getArmyLists(Context context) {
		Log.d(TAG,"getArmyLists");
		ArrayList<ArmyListDescriptor> result = new ArrayList<ArmyListDescriptor>();
		try {
			File dirFile = context.getDir(ARMY_LISTS_DIR, Context.MODE_PRIVATE);
			File[] armies = dirFile.listFiles();
			
			for (File army : armies) {
				
				FileInputStream fis = new FileInputStream(army);
				ObjectInputStream is = new ObjectInputStream(fis);
				
				try {
					Object object = is.readObject();
					Log.d(TAG,"loaded : " + object.toString());
					ArmyStore store = (ArmyStore) object;
					
					ArmyListDescriptor descriptor = new ArmyListDescriptor(store);
					result.add(descriptor);
				} catch (Exception e) {
					// can not read file --> delete is
					Log.w(TAG, "file " + army.getName() + " can not be processed : will be deleted");
					try {
						is.close();
						fis.close();
						army.delete();
					} catch (Exception ee) {
						Log.e(TAG, "failed to delete file " + army.getName());
					}
				}				
				
				is.close();
				fis.close();
			}
			
			Collections.sort(result);
			
			Log.d(TAG,"armies = " + result.toString());
			
		} catch (Exception e) {
			Log.e("StorageManager - getArmyLists", e.getMessage());
			e.printStackTrace();
		} finally {
		}

		return result;
	}

	public static ArrayList<BattleListDescriptor> getBattleLists(Context context) {
		Log.d(TAG,"getBattleLists");
		ArrayList<BattleListDescriptor> result = new ArrayList<BattleListDescriptor>();
		try {
			File dirFile = context.getDir(BATTLE_LISTS_DIR, Context.MODE_PRIVATE);
			File[] armies = dirFile.listFiles();
			
			for (File army : armies) {
				
				Log.d(TAG,"getBattleLists : army = " + army.getName());
				FileInputStream fis = new FileInputStream(army);
				ObjectInputStream is = new ObjectInputStream(fis);

				try {
					Object object = is.readObject();
					Log.d(TAG,"loaded : " + object.toString());
					BattleStore store = (BattleStore) object;
					
					BattleListDescriptor descriptor = new BattleListDescriptor(store);
					result.add(descriptor);
				} catch (Exception e) {
					// can not read file --> delete is
					Log.w(TAG, "file " + army.getName() + " can not be processed : will be deleted");
					try {
						is.close();
						fis.close();
						army.delete();
					} catch (Exception ee) {
						Log.e(TAG, "failed to delete file " + army.getName());
					}
				}
				
				is.close();
				fis.close();
			}
			Log.d(TAG,"battles = " + result.toString());
		} catch (Exception e) {
			Log.e("StorageManager - getArmyLists", e.toString());
			e.printStackTrace();
		} finally {
		}

		Collections.sort(result);
		return result;
	}

	public static boolean  existsArmyList(Context context, String filename) {
		try {
			File dirFile = context.getDir(ARMY_LISTS_DIR, Context.MODE_PRIVATE);
			
			File fileToCheck = new File(dirFile, filename);
			
			return fileToCheck.exists();
		} catch (Exception e) {
			Log.e("StorageManager - existsArmyList", e.getMessage());
		} finally {
		}
		return false;
	}

	
	public static boolean  deleteArmyList(Context context, String filename) {
		Log.d(TAG, "deleteArmyList - " + filename);
		try {
			File dirFile = context.getDir(ARMY_LISTS_DIR, Context.MODE_PRIVATE);
			
			File fileToDelete = new File(dirFile, filename);
			
			return fileToDelete.delete();
		} catch (Exception e) {
			Log.e("StorageManager - deleteArmyList", e.toString());
			e.printStackTrace();
		} finally {
		}
		return false;
	}
	
	public static boolean  deleteImportedFile(Context context, File fileToDelete) {
		Log.d(TAG, "deleteImportedFile - " + fileToDelete);
		try {
			return fileToDelete.delete();
		} catch (Exception e) {
			Log.e("StorageManager - deleteImportedFile", e.toString());
			e.printStackTrace();
		} finally {
		}
		return false;
	}

	public static boolean  deleteBattle(Context context, String filename) {
		try {
			File dirFile = context.getDir(BATTLE_LISTS_DIR, Context.MODE_PRIVATE);
			
			File fileToDelete = new File(dirFile, filename);
			
			return fileToDelete.delete();
		} catch (Exception e) {
			Log.e("StorageManager - deleteBattle", e.toString());
			e.printStackTrace();
		} finally {
		}
		return false;
	}
	public static boolean  renameArmyList(Context context, String oldFilename, String newFilename) {
		try {
			File dirFile = context.getDir(ARMY_LISTS_DIR, Context.MODE_PRIVATE);
			
			File fileToRename = new File(dirFile, oldFilename);
			File newFile = new File(dirFile, newFilename);
			
			return fileToRename.renameTo(newFile);
		} catch (Exception e) {
			Log.e("StorageManager - renameArmyList", e.getMessage());
		} finally {
		}
		return false;
	}

	public static boolean  copyArmyList(Context context, String oldFilename, String newFilename) {
		Log.d(TAG, "copyArmyList");
		File dirFile = context.getDir(ARMY_LISTS_DIR, Context.MODE_PRIVATE);
		File fileToRead = new File(dirFile, oldFilename);
		File fileToWrite = new File(dirFile, newFilename);
		
		if (!oldFilename.equals(newFilename)) {
			try {
				FileOutputStream outStream = new FileOutputStream(fileToWrite);

				FileInputStream inStream = new FileInputStream(fileToRead);

				byte[] buffer = new byte[1024];

				int length;
				// copy the file content in bytes
				while ((length = inStream.read(buffer)) > 0) {
					outStream.write(buffer, 0, length);
				}

				inStream.close();
				outStream.close();
				return true;
			} catch (Exception e) {
				Log.e("StorageManager - copyArmyList", e.getMessage());
			} finally {
			}

		}
		return false;
	}	
	
	public static final void updateLastViewedArmyList(Context context, String armyFileName) {
		Log.d(TAG, "updateLastViewedArmyList");

		try {
			File dirFile = context.getDir(LAST_FILES, Context.MODE_PRIVATE);
			
			File fileToWrite = new File(dirFile, ARMY_LIST_LAST_FILE);
			FileOutputStream fos = new FileOutputStream(fileToWrite);
			ObjectOutputStream ois = new ObjectOutputStream(fos);
			ois.writeObject(armyFileName);
			ois.close();
			fos.close();
		} catch (Exception e) {
			Log.e("StorageManager - updateLastViewedArmyList", e.getMessage());
		} finally {
		}
	}
	
	public static final void updateLastBattle(Context context, String armyFileName) {
		Log.d(TAG, "updateLastBattle");

		try {
			File dirFile = context.getDir(LAST_FILES, Context.MODE_PRIVATE);
			
			File fileToWrite = new File(dirFile, BATTLE_LAST_FILE);
			FileOutputStream fos = new FileOutputStream(fileToWrite);
			ObjectOutputStream ois = new ObjectOutputStream(fos);
			ois.writeObject(armyFileName);
			ois.close();
			fos.close();
		} catch (Exception e) {
			Log.e("StorageManager - updateLastBattle", e.getMessage());
		} finally {
		}
	}
	
	public static final String getLastViewedArmyList(Context context) {
		Log.d(TAG, "getLastViewedArmyList");
		try {
			File dirFile = context.getDir(LAST_FILES, Context.MODE_PRIVATE);
			
			File fileToRead = new File(dirFile, ARMY_LIST_LAST_FILE);
			FileInputStream fis = new FileInputStream(fileToRead);
			ObjectInputStream iis = new ObjectInputStream(fis);
			String fileName = (String) iis.readObject();
			iis.close();
			fis.close();
			
			return fileName;
		} catch (Exception e) {
			Log.e("StorageManager - getLastViewedArmyList", e.getMessage());
		} finally {
		}
		return "";
	}
	
	public static final String getLastViewedBattle(Context context) {
		Log.d(TAG, "getLastViewedBattle");
		try {
			File dirFile = context.getDir(LAST_FILES, Context.MODE_PRIVATE);
			
			File fileToRead = new File(dirFile, BATTLE_LAST_FILE);
			FileInputStream fis = new FileInputStream(fileToRead);
			ObjectInputStream iis = new ObjectInputStream(fis);
			String fileName = (String) iis.readObject();
			iis.close();
			fis.close();
			
			return fileName;
		} catch (Exception e) {
			Log.e("StorageManager - getLastViewedBattle", e.getMessage());
		} finally {
		}
		return "";
	}
	
	public static String fixFileNameForSave(String s) {
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < s.length(); ++i) {
			if (!isIllegalFileNameChar(s.charAt(i)))
				sb.append(s.charAt(i));
		}
		return sb.toString();
	}

	private static boolean isIllegalFileNameChar(char c) {
		boolean isIllegal = false;
		for (int i = 0; i < ILLEGAL_CHARACTERS.length; i++) {
			if (c == ILLEGAL_CHARACTERS[i])
				isIllegal = true;
		}
		return isIllegal;
	}
	
	public static boolean saveArmyList(Context applicationContext, SelectionModelSingleton singleton) {
		String armyName = singleton.getArmyFileName();
		Log.d(TAG, "saveArmyList, name = " + armyName);
		File armyListsDir = applicationContext.getDir(ARMY_LISTS_DIR, Context.MODE_PRIVATE);
		
		FileOutputStream fos = null;
		ObjectOutputStream oos = null;
		boolean keep = true;

		String validArmyName = fixFileNameForSave(armyName);
		
		try {
			File fileToSave = new File(armyListsDir, validArmyName);
			fileToSave.createNewFile();
			fos = new FileOutputStream(fileToSave);
			
//			
//			fos = applicationContext.openFileOutput(validArmyName,
//					Context.MODE_PRIVATE);
//			;
			oos = new ObjectOutputStream(fos);
			
			ArmyStore store = new ArmyStore(armyName);
			store.setFilename(armyName);
			store.setFactionId(singleton.getFaction().getId());
			store.setNbCasters(singleton.getNbCasters());
			store.setNbPoints(singleton.getNbPoints());
			store.setEntries(singleton.getSelectedEntries());
			store.setTierId(singleton.getCurrentTiers()==null?"":singleton.getCurrentTiers().getId());
			store.setContractId(singleton.getCurrentContract()==null?"":singleton.getCurrentContract().getContractId());
			
			oos.writeObject(store);

			singleton.setArmyFileName(validArmyName); 
			singleton.setSaved(true);
		} catch (Exception e) {
			keep = false;
		} finally {
			try {
				if (oos != null)
					oos.close();
				if (fos != null)
					fos.close();
			} catch (Exception e) { /* do nothing */
				e.printStackTrace();
			}
		}

		updateLastViewedArmyList(applicationContext, validArmyName);
		
		Log.d(TAG, "army list saved, name = " + armyName);
		return keep;
	}	
	
	
	public static boolean saveBattle(Context applicationContext, String armyName, BattleSingleton singleton) {
		Log.d(TAG, "save battle, name = " + armyName);
		File battleListsDir = applicationContext.getDir(BATTLE_LISTS_DIR, Context.MODE_PRIVATE);
		
		FileOutputStream fos = null;
		ObjectOutputStream oos = null;
		boolean keep = true;

		String validArmyName = fixFileNameForSave(armyName);
		
		try {
			File fileToSave = new File(battleListsDir, validArmyName);
			fileToSave.createNewFile();
			fos = new FileOutputStream(fileToSave);
			oos = new ObjectOutputStream(fos);
			
			BattleStore store = new BattleStore();
			store.setFilename(validArmyName);
			store.setTitle(armyName);
			store.setArmy(singleton.getArmy(BattleSingleton.PLAYER1), BattleSingleton.PLAYER1);
			store.setArmy(singleton.getArmy(BattleSingleton.PLAYER2), BattleSingleton.PLAYER2);
			store.setBattleEntries(singleton.getEntries(BattleSingleton.PLAYER1), BattleSingleton.PLAYER1);
			store.setBattleEntries(singleton.getEntries(BattleSingleton.PLAYER2), BattleSingleton.PLAYER2);
			
			store.setPlayer1TimeRemaining(singleton.getPlayer1Chrono().getTimeRemainingMillis());
			store.setPlayer2TimeRemaining(singleton.getPlayer2Chrono().getTimeRemainingMillis());
			
			oos.writeObject(store);
		} catch (Exception e) {
			keep = false;
		} finally {
			try {
				if (oos != null)
					oos.close();
				if (fos != null)
					fos.close();
			} catch (Exception e) { /* do nothing */
				e.printStackTrace();
			}
		}

		Log.d(TAG, "battle saved, name = " + armyName);
		return keep;
	}		
	/**
	 * load army list given by file-name into singleton
	 * @param applicationContext
	 * @param army_name
	 * @param singleton
	 * @return
	 */
	public static boolean loadArmyList(Context applicationContext, String army_name, SelectionModelSingleton singleton) {
		FileInputStream fis = null;
		ObjectInputStream is = null;

		try {
			
			File armyListsDir = applicationContext.getDir(ARMY_LISTS_DIR, Context.MODE_PRIVATE);
			File fileToRead = new File(armyListsDir, army_name);
			
			fis = new FileInputStream(fileToRead);
			is = new ObjectInputStream(fis);

			ArmyStore store = (ArmyStore) is.readObject();
			
			singleton.setFaction(FactionNamesEnum.getFaction(store.getFactionId()));
			singleton.cleanAll();
			
			singleton.setNbCasters(store.getNbCasters());
			singleton.setNbPoints(store.getNbPoints());
			
			
			singleton.getSelectedEntries().clear();
			singleton.getSelectedEntries().addAll(store.getEntries());
			
			if (store.getTierId() != null && store.getTierId().length() > 0) {
				singleton.setCurrentTiers(ArmySingleton.getInstance().getTier(store.getTierId()));	
			}
			if (store.getContractId() != null && store.getContractId().length() > 0) {
				singleton.setCurrentContract(ArmySingleton.getInstance().getContract(store.getContractId()));
			}
			
			singleton.setArmyFileName(store.getFilename());
			singleton.setSaved(true);
			
			updateLastViewedArmyList(applicationContext, army_name);
			
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (fis != null)
					fis.close();
				if (is != null)
					is.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return true;
	}	
	
	/**
	 * indicates that a battle status was saved for army_name
	 * @param applicationContext
	 * @param army_name
	 * @return
	 */
	public static boolean isExistingBattle(Context applicationContext, String army_name) {

		try {
			File armyListsDir = applicationContext.getDir(BATTLE_LISTS_DIR, Context.MODE_PRIVATE);
			File fileToRead = new File(armyListsDir, army_name);
			return fileToRead.exists();
		} catch (Exception e) {
				e.printStackTrace();
		} finally {
		}
		return false;
	}
	
	/**
	 * load army list given by file-name into singleton
	 * @param applicationContext
	 * @param armyName
	 * @param singleton
	 * @return
	 */
	public static boolean loadExistingBattle(Context applicationContext, String armyName, BattleSingleton singleton) {
		Log.d(TAG, "loadExistingBattle, name = " + armyName);
		FileInputStream fis = null;
		ObjectInputStream is = null;

		try {
			
			File armyListsDir = applicationContext.getDir(BATTLE_LISTS_DIR, Context.MODE_PRIVATE);
			File fileToRead = new File(armyListsDir, armyName);
			
			fis = new FileInputStream(fileToRead);
			is = new ObjectInputStream(fis);

			
			BattleStore store = (BattleStore) is.readObject();
			
			singleton.setArmy(store.getArmy(BattleSingleton.PLAYER1), BattleSingleton.PLAYER1);
			singleton.setArmy(store.getArmy(BattleSingleton.PLAYER2), BattleSingleton.PLAYER2);

			singleton.getEntries(BattleSingleton.PLAYER1).clear();
			singleton.getEntries(BattleSingleton.PLAYER1).addAll(store.getBattleEntries(BattleSingleton.PLAYER1));
			
			singleton.getEntries(BattleSingleton.PLAYER2).clear();
			singleton.getEntries(BattleSingleton.PLAYER2).addAll(store.getBattleEntries(BattleSingleton.PLAYER2));

			singleton.getPlayer1Chrono().pause(SystemClock.elapsedRealtime());
			singleton.getPlayer2Chrono().pause(SystemClock.elapsedRealtime());
			singleton.getPlayer1Chrono().setInitialPlayerTimeInMillis(store.getPlayer1TimeRemaining());
			singleton.getPlayer2Chrono().setInitialPlayerTimeInMillis(store.getPlayer2TimeRemaining());
			
			for (BattleEntry entry : store.getBattleEntries(BattleSingleton.PLAYER1)) {
				ArmyElement element = ArmySingleton.getInstance().getArmyElement(entry.getId());
				entry.setReference(element);
			}

			for (BattleEntry entry : store.getBattleEntries(BattleSingleton.PLAYER2)) {
				ArmyElement element = ArmySingleton.getInstance().getArmyElement(entry.getId());
				entry.setReference(element);
			}

			
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (fis != null)
					fis.close();
				if (is != null)
					is.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		Log.d(TAG, "battle loaded, name = " + armyName);
		Log.d(TAG, "entries stored in singleton = " + singleton.getEntries(BattleSingleton.PLAYER1).toString());
		return true;
	}		
	
	
	
	/**
	 * load army list given by file-name into singleton
	 * @param applicationContext
	 * @param army_name
	 * @param singleton
	 * @return
	 */
	public static boolean createBattleFromArmy(Context applicationContext, String army_name, BattleSingleton singleton, int playerNumber) {
		Log.d(TAG, "createBattleFromArmy" + army_name);
		FileInputStream fis = null;
		ObjectInputStream is = null;

		
		SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(applicationContext);
		String prefsMinutes = sharedPref.getString(PreferenceConstants.TIMER_MINUTES, "60");
		
		singleton.reInitAndConfigChrono(Integer.parseInt(prefsMinutes));
		
		List<BattleEntry> entries = new ArrayList<BattleEntry>();
		
		int entryCounter = 1;
		
		try {
			
			File armyListsDir = applicationContext.getDir(ARMY_LISTS_DIR, Context.MODE_PRIVATE);
			File fileToRead = new File(armyListsDir, army_name);
			
			fis = new FileInputStream(fileToRead);
			is = new ObjectInputStream(fis);

			ArmyStore store = (ArmyStore) is.readObject();
			singleton.setArmy(store, playerNumber);
			
			List<SelectedEntry> result = (List<SelectedEntry>) store.getEntries();
			Log.d(TAG, "read List<SelectedEntry> = "
					+ result.toString());
			
			Collections.sort(result);
			// selected entries are pre-sorted before calcutating ids
			
			for (SelectedEntry entry : result) {
				
				
				
				ArmyElement element = ArmySingleton.getInstance().getArmyElement(entry.getId());
				
				BattleEntry bEntry = null; 
				if (element instanceof ArmyCommander) {
					if (element.getModels().size() == 1) {
						
						if(element.getModels().get(0).getHitpoints() instanceof WarjackDamageGrid) {
							// karchev!
							bEntry = new KarchevEntry(element, entryCounter++);
						} else {
							bEntry = new SingleDamageLineEntry(element, entryCounter++);	
						}
						
							
					} else {
						bEntry = new MultiPVUnit(entry, element, entryCounter++);
					}
					entries.add(bEntry);
				} else if (element instanceof Unit) {
					Unit unit = (Unit) element;
					bEntry = new MultiPVUnit((SelectedUnit) entry, unit, entryCounter++);
					entries.add(bEntry);
					
					if ( ((SelectedUnit) entry).getRankingOfficer() != null) {
						SelectedRankingOfficer ra = ((SelectedUnit) entry).getRankingOfficer();
						ArmyElement raDescription = ArmySingleton.getInstance().getArmyElement(ra.getId());
						BattleEntry raEntry = new MultiPVUnit(ra, (ArmyElement) raDescription, entryCounter++);
						raEntry.setAttached(true);
						raEntry.setParentId(bEntry.getUniqueId());
						//bEntry.getChilds().add(raEntry);
						entries.add(raEntry);
					}
					
					if ( ((SelectedUnit) entry).getUnitAttachment() != null) {
						SelectedUA ua = ((SelectedUnit) entry).getUnitAttachment();
						ArmyElement uaDescription = ArmySingleton.getInstance().getArmyElement(ua.getId());
						BattleEntry uaEntry = new MultiPVUnit(ua, (ArmyElement) uaDescription, entryCounter++);
						uaEntry.setAttached(true);
						uaEntry.setParentId(bEntry.getUniqueId());
						//bEntry.getChilds().add(uaEntry);
						entries.add(uaEntry);
					}
					
					if ( ! ((SelectedUnit) entry).getWeaponAttachments().isEmpty() ) {
						SelectedWA wa = ((SelectedUnit) entry).getWeaponAttachments().get(0);
						ArmyElement waDescription = ArmySingleton.getInstance().getArmyElement(wa.getId());
						BattleEntry waEntry = new MultiPVUnit(wa, (WeaponAttachment) waDescription, ((SelectedUnit) entry).getWeaponAttachments().size() );
						waEntry.setAttached(true);
						waEntry.setParentId(bEntry.getUniqueId());
						//bEntry.getChilds().add(waEntry);
						entries.add(waEntry);
					}

				} else if (element instanceof Solo){
					if (element.hasMultiPVModels()) {
						if (element.getModels().size() == 1) {
							bEntry = new SingleDamageLineEntry(element, entryCounter++);
						} else {
							// dragoon
							bEntry = new MultiPVUnit(entry, element, entryCounter++);
						}
					} else {
						bEntry = new BattleEntry(element, entryCounter++);
					}
					entries.add(bEntry);
				} else if (element instanceof BattleEngine) {
					bEntry = new SingleDamageLineEntry(element, entryCounter++);
					entries.add(bEntry);
				} else {
					bEntry = new BattleEntry(element, entryCounter++);
					entries.add(bEntry);
				}

				// attach descendants
				if (entry instanceof JackCommander) {
					for (SelectedWarjack jack : ((JackCommander) entry).getJacks()) {
						Warjack aJack = (Warjack) ArmySingleton.getInstance().getArmyElement(jack.getId());
						JackEntry jackBattleEntry = new JackEntry(aJack, bEntry, entryCounter++);
						entries.add(jackBattleEntry);
						//bEntry.getChilds().add(jackBattleEntry);
					}
				}
				
				if (entry instanceof BeastCommander) {
					for (SelectedWarbeast beast : ((BeastCommander) entry).getBeasts()) {
						Warbeast aBeast = (Warbeast) ArmySingleton.getInstance().getArmyElement(beast.getId());
						BeastEntry beastBattleEntry = new BeastEntry(aBeast, bEntry, entryCounter++);
						entries.add(beastBattleEntry);
						//bEntry.getChilds().add(beastBattleEntry);
					}
				}
				
				if (entry instanceof SelectedArmyCommander) {
					if ( ((SelectedArmyCommander)entry).getAttachment() != null) {
						Solo attachment = (Solo) ArmySingleton.getInstance().getArmyElement(((SelectedArmyCommander)entry).getAttachment().getId());
						BattleEntry soloEntry = null; 
						if (attachment.hasMultiPVModels()) {
							if (attachment.getModels().size() == 1) {
								soloEntry = new SingleDamageLineEntry(attachment, entryCounter++);
							} else {
								// dragoon
								soloEntry = new MultiPVUnit(entry, attachment, entryCounter++);
							}
						} else {
							soloEntry = new BattleEntry(attachment, entryCounter++);
						}
						entries.add(soloEntry);
						soloEntry.setAttached(true);
						soloEntry.setParentId(bEntry.getUniqueId());
						//bEntry.getChilds().add(soloEntry);
					}
				}
				
				singleton.getEntries(playerNumber).clear();
				singleton.getEntries(playerNumber).addAll(entries);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (fis != null)
					fis.close();
				if (is != null)
					is.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return true;
	}
	
	public static ArrayList<File> getImportedDataFiles(Context applicationContext) {
		File importFilesDir = applicationContext.getDir(IMPORT_FILES_DIR, Context.MODE_PRIVATE);
		
//		File externalStorageDir = Environment.getExternalStorageDirectory ();
//		String whacExternalDirPath = externalStorageDir.getPath() + "/Whac";
//		File whacExternalDir = new File(whacExternalDirPath);
		
		
		File[] files = importFilesDir.listFiles();
		
		ArrayList<File> result = new ArrayList<File>();
		for (File file : files) {
			result.add(file);
		}
				
		return result;
	}

	public static List<File> getDataFilesToImport(Context applicationContext, String subdir) {
		File storageDir = null;
		
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.FROYO) {
    		if (subdir.equals(DOWNLOAD_SUBDIR)) {
    			storageDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
    		} else {
    			File externalStorageDir = Environment.getExternalStorageDirectory ();	
    			String whacExternalDirPath = externalStorageDir.getPath() + subdir; 
    			storageDir = new File(whacExternalDirPath);
    		}
        } else {
			File externalStorageDir = Environment.getExternalStorageDirectory ();	
			String whacExternalDirPath = externalStorageDir.getPath() + subdir; 
			storageDir = new File(whacExternalDirPath);
        }
		

		File[] files = storageDir.listFiles();
		ArrayList<File> result = new ArrayList<File>();
		if (files != null) {
			for (File file : files) {
				result.add(file);
			}
		}
		return result;
	}
	
	public static boolean importDataFiles(Context applicationContext) {
		Log.d(TAG,"importDataFiles");
		File importFilesDir = applicationContext.getDir(IMPORT_FILES_DIR, Context.MODE_PRIVATE);
		
		File externalStorageDir = Environment.getExternalStorageDirectory ();
		String whacExternalDirPath = externalStorageDir.getPath() + WHAC_SUBDIR;
		File whacExternalDir = new File(whacExternalDirPath);

		File[] files = whacExternalDir.listFiles();
		
		for (File fileToRead : files) {
			Log.d(TAG,"copying file : " + fileToRead.toString());
			File fileToWrite = new File(importFilesDir, fileToRead.getName());
			try {
				FileOutputStream outStream = new FileOutputStream(fileToWrite);

				FileInputStream inStream = new FileInputStream(fileToRead);

				byte[] buffer = new byte[1024];

				int length;
				// copy the file content in bytes
				while ((length = inStream.read(buffer)) > 0) {
					outStream.write(buffer, 0, length);
				}

				inStream.close();
				outStream.close();
			} catch (Exception e) {
				e.printStackTrace();
				Log.e("StorageManager - importDataFiles", e.getMessage());
			} finally {
			}
		}
		
		return true;

	}
	
	public static boolean importDataFileFromContentBuffer(Context applicationContext, String fileName, StringBuffer content) {
		Log.d(TAG,"importDataFileFromInternet");
		File importFilesDir = applicationContext.getDir(IMPORT_FILES_DIR, Context.MODE_PRIVATE);
		
		Log.d(TAG,"creating file : " + fileName);
		File fileToWrite = new File(importFilesDir, fileName);
		try {
			FileOutputStream outStream = new FileOutputStream(fileToWrite);
			// copy the file content in bytes
			outStream.write(content.toString().getBytes("UTF-8"));
			outStream.close();
		} catch (Exception e) {
			e.printStackTrace();
			Log.e("StorageManager - importDataFileFromInternet", e.getMessage());
		} finally {
		}
		
		return true;

	}

	public static void saveBattleResult(Context applicationContext, BattleResult result) {
		Log.d(TAG, "saveBattleResult, name = " + result.getArmyName());
		File armyListsDir = applicationContext.getDir(BATTLE_RESULTS_DIR, Context.MODE_PRIVATE);
		
		FileOutputStream fos = null;
		ObjectOutputStream oos = null;

		String validArmyName = fixFileNameForSave(result.getArmyName());
		
		try {
			File fileToSave = new File(armyListsDir, validArmyName);
			fileToSave.createNewFile();
			fos = new FileOutputStream(fileToSave);
			oos = new ObjectOutputStream(fos);
			oos.writeObject(result);
		} catch (Exception e) {
			Log.w(TAG, e.getMessage());
			e.printStackTrace();
		} finally {
			try {
				if (oos != null)
					oos.close();
				if (fos != null)
					fos.close();
			} catch (Exception e) { /* do nothing */
				e.printStackTrace();
			}
		}

		Log.d(TAG, "battle result saved, name = " + result.getArmyName());
	}
	
	public static boolean  deleteBattleResult(Context context, String filename) {
		Log.d(TAG, "deleteBattleResult - " + filename);
		try {
			File dirFile = context.getDir(BATTLE_RESULTS_DIR, Context.MODE_PRIVATE);
			
			File fileToDelete = new File(dirFile, filename);
			
			return fileToDelete.delete();
		} catch (Exception e) {
			Log.e("StorageManager - deleteBattleResult", e.toString());
			e.printStackTrace();
		} finally {
		}
		return false;
	}
	

	public static List<BattleResult> getBattleResults(Context applicationContext) {
		Log.d(TAG,"getBattleResults");
		ArrayList<BattleResult> result = new ArrayList<BattleResult>();
		try {
			File dirFile = applicationContext.getDir(BATTLE_RESULTS_DIR, Context.MODE_PRIVATE);
			File[] results = dirFile.listFiles();
			
			for (File battleResult : results) {
				
				Log.d(TAG,"getBattleLists : army = " + battleResult.getName());
				FileInputStream fis = new FileInputStream(battleResult);
				ObjectInputStream is = new ObjectInputStream(fis);

				try {
					Object object = is.readObject();
					Log.d(TAG,"loaded : " + object.toString());
					BattleResult store = (BattleResult) object;
					result.add(store);
				} catch (Exception e) {
					// can not read file --> delete is
					Log.w(TAG, "file " + battleResult.getName() + " can not be processed : will be deleted");
					try {
						is.close();
						fis.close();
						battleResult.delete();
					} catch (Exception ee) {
						Log.e(TAG, "failed to delete file " + battleResult.getName());
					}
				}
				
				is.close();
				fis.close();
			}
			Log.d(TAG,"results = " + result.toString());
		} catch (Exception e) {
			Log.e("StorageManager - getArmyLists", e.toString());
			e.printStackTrace();
		} finally {
		}

		return result;		
	}

	/**
	 * 
	 * @param applicationContext
	 * @return fileName
	 */
	public static String exportStats(Context applicationContext) {
		Log.d(TAG, "exportStats" );
		String filename = "";
		
		File externalStorageDir = Environment.getExternalStorageDirectory ();
		String whacExternalDirPath = externalStorageDir.getPath() + WHAC_SUBDIR;
		File whacExternalDir = new File(whacExternalDirPath);

		List<BattleResult> results = getBattleResults(applicationContext);
		
		FileOutputStream fos = null;
		Date date = new Date();
		
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd", Locale.getDefault());

		String validArmyName = "export_stats-" + sdf.format(date) + ".csv";
		
		PrintStream ps; 
		
		try {
			File fileToSave = new File(whacExternalDir, validArmyName);
			fileToSave.createNewFile();
			
			filename = fileToSave.getPath();
			fos = new FileOutputStream(fileToSave);
			ps = new PrintStream(fos);
			
			ps.println("date;opponent;win/lose;scenario;clock type;win condition;personal note;battle short description");
			
			for (BattleResult br : results) {
				ps.print(sdf.format(br.getBattleDate()));
				ps.print(";");
				ps.print(br.getPlayer2name());
				ps.print(";");
				ps.print(br.getWinnerNumber() == BattleResult.PLAYER_1_WINS ? "WIN":"LOST");
				ps.print(";");
				ps.print(br.getScenario());
				ps.print(";");
				ps.print(br.getClockType());
				ps.print(";");
				ps.print(br.getVictoryCondition());
				ps.print(";");
				
				String protectedNotes = br.getNotes().replace(";", "");
				protectedNotes = protectedNotes.replace("\n", "-");
				ps.print(protectedNotes);
				ps.print(";");
				ps.print(br.getDescription());
				ps.print(";");
				ps.println();	
			}
			
			ps.close();
			
		} catch (Exception e) {
			Log.w(TAG, e.getMessage());
			e.printStackTrace();
		} finally {
			try {
				if (fos != null)
					fos.close();
			} catch (Exception e) { /* do nothing */
				e.printStackTrace();
			}
		}

		Log.d(TAG, "exportStats ended");
		return filename;
	}
	
}
